"use client";

/**
 * RealtimeProvider — Single Supabase Realtime connection per workspace.
 *
 * Replaces the old GlobalLiveSyncProvider which used:
 * - 6-second polling of /api/v1/inbox/live-sync (global)
 * - 3-second polling of /api/v1/messages (per-conversation)
 * - Redundant per-conversation Realtime subscriptions
 *
 * Now: ONE Realtime channel for the entire workspace that listens to
 * conversations + messages tables. All state flows through the Zustand
 * inbox store. Zero polling. Zero redundant API calls.
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { soundManager } from "@/lib/sound-notifications";
import { PlatformIcon } from "@/components/platform-icon";
import type { Database, Platform } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};

interface ToastNotification {
  id: string;
  conversationId: string;
  senderName: string;
  preview: string;
  platform: Platform;
  avatarUrl?: string | null;
}

// ── Context (lightweight — just workspace ID and toast state) ─────────────

interface RealtimeContextValue {
  workspaceId: string;
  connectionStatus: "connected" | "reconnecting" | "disconnected";
}

const RealtimeContext = createContext<RealtimeContextValue>({
  workspaceId: "",
  connectionStatus: "disconnected",
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

// ── Backward-compatible export ────────────────────────────────────────────
export function useGlobalLiveSync() {
  const unreadCount = useInboxStore((s) => s.unreadCount);
  const conversations = useInboxStore((s) => s.conversations);
  const markAsRead = useInboxStore((s) => s.markAsRead);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);

  return {
    unreadCount,
    conversations,
    soundEnabled,
    setSoundEnabled,
    syncNow: async () => {},
    markConversationAsRead: async (id: string) => {
      markAsRead(id);
      try {
        const supabase = createClient();
        await supabase
          .from("conversations")
          .update({ unread_count: 0 })
          .eq("id", id);
      } catch (err) {
        console.warn("[realtime] markAsRead error:", err);
      }
    },
  };
}

// ── Provider Component ────────────────────────────────────────────────────

export function GlobalLiveSyncProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "reconnecting" | "disconnected">("disconnected");

  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const upsertConversation = useInboxStore((s) => s.upsertConversation);
  const addMessage = useInboxStore((s) => s.addMessage);
  const setConversations = useInboxStore((s) => s.setConversations);

  const isInitialLoadRef = useRef(true);
  const lastSeenMessageTimeByConv = useRef<Map<string, number>>(new Map());

  // ── Notification trigger ──────────────────────────────────────────────

  const triggerNotification = useCallback(
    (conv: Conversation) => {
      const { isSoundMuted, isToastsMuted } = useInboxStore.getState();

      if (soundEnabled && !isSoundMuted) {
        soundManager.playMessageChime();
      }

      const senderName =
        conv.contacts?.display_name ||
        ((conv.contacts?.metadata as any)?.username
          ? `@${(conv.contacts?.metadata as any).username}`
          : null) ||
        "Customer";
      const preview = conv.last_message_preview || "New message received";

      if (!isToastsMuted) {
        setActiveToast({
          id: `toast-${Date.now()}`,
          conversationId: conv.id,
          senderName,
          preview,
          platform: (conv.platform as Platform) || "instagram",
          avatarUrl: conv.contacts?.avatar_url,
        });
      }

      soundManager.showDesktopNotification(`New message from ${senderName}`, {
        body: preview,
      });

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setActiveToast((curr) =>
          curr?.conversationId === conv.id ? null : curr
        );
      }, 5000);
    },
    [soundEnabled]
  );

  // ── 1. Initial load: fetch conversations from Supabase directly ────────

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadInitialConversations() {
      try {
        const [ { data }, { data: counts } ] = await Promise.all([
          supabase
            .from("conversations")
            .select("*, contacts(*), channels(*)")
            .eq("workspace_id", workspaceId)
            .order("last_message_at", {
              ascending: false,
              nullsFirst: false,
            })
            .limit(200),
          (supabase as any).rpc("get_workspace_unread_counts", { ws_id: workspaceId })
        ]);

        if (isMounted && data && data.length > 0) {
          setConversations(data as Conversation[], counts as { all: number; by_platform: Record<string, number> });
          // Mark all initial conversations timestamp as known so no fake alerts trigger
          data.forEach((c) => {
            const timeEpoch = c.last_message_at ? new Date(c.last_message_at).getTime() : Date.now();
            lastSeenMessageTimeByConv.current.set(c.id, timeEpoch);
          });
        }
        isInitialLoadRef.current = false;
      } catch (err) {
        console.warn("[realtime] initial load error:", err);
        isInitialLoadRef.current = false;
      }
    }

    loadInitialConversations();
    return () => {
      isMounted = false;
    };
  }, [workspaceId, setConversations]);

  // ── 2. Supabase Realtime: SINGLE channel for entire workspace ──────────

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      // Listen for conversation changes (new, updated)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const updated =
              payload.new as Database["public"]["Tables"]["conversations"]["Row"];

            // Fetch the full conversation with contact data
            const { data: fullConv } = await supabase
              .from("conversations")
              .select("*, contacts(*), channels(*)")
              .eq("id", updated.id)
              .single();

            if (fullConv) {
              const typed = fullConv as Conversation;
              upsertConversation(typed);

              const msgTime = typed.last_message_at ? new Date(typed.last_message_at).getTime() : 0;
              const lastKnownTime = lastSeenMessageTimeByConv.current.get(typed.id) || 0;
              const isGenuinelyNewMessage = msgTime > lastKnownTime;

              // Update last seen timestamp
              if (msgTime > 0) {
                lastSeenMessageTimeByConv.current.set(typed.id, Math.max(msgTime, lastKnownTime));
              }

              // Trigger notification ONLY if this is a genuinely new message received after initial load
              if (
                !isInitialLoadRef.current &&
                isGenuinelyNewMessage &&
                typed.unread_count > 0
              ) {
                triggerNotification(typed);
              }
              
              // If this conversation is currently open, instantly refetch the messages thread
              const { selectedConversationId, setMessages } = useInboxStore.getState();
              if (selectedConversationId === typed.id && !isInitialLoadRef.current) {
                fetch(`/api/v1/messages?conversationId=${typed.id}`)
                  .then((res) => res.json())
                  .then((data) => {
                    if (Array.isArray(data)) {
                      setMessages(typed.id, data);
                    }
                  })
                  .catch((err) => console.error("[realtime] failed to fetch updated thread:", err));
              }
            }
          } else if (payload.eventType === "DELETE") {
            const deleted =
              payload.old as Database["public"]["Tables"]["conversations"]["Row"];
            if (deleted.id) {
              useInboxStore.getState().removeConversation(deleted.id);
            }
          }
        }
      )
      // Listen for new messages
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const message =
            payload.new as Database["public"]["Tables"]["messages"]["Row"];
          if (message.conversation_id) {
            addMessage(message.conversation_id, message);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR" || status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, upsertConversation, addMessage, triggerNotification]);

  // ── Toast click handler ────────────────────────────────────────────────

  const handleToastClick = useCallback(
    (conversationId: string) => {
      setActiveToast(null);
      router.push(`/dashboard/inbox?conversationId=${conversationId}`);
    },
    [router]
  );

  return (
    <RealtimeContext.Provider value={{ workspaceId, connectionStatus }}>
      {children}

      {/* Global Floating Toast Popup */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-[9999] flex w-80 sm:w-96 items-center gap-3 rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200">
          <div
            className="relative shrink-0 cursor-pointer"
            onClick={() => handleToastClick(activeToast.conversationId)}
          >
            {activeToast.avatarUrl ? (
              <img
                src={activeToast.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {activeToast.senderName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-background bg-background shadow-xs">
              <PlatformIcon
                platform={activeToast.platform}
                className="h-2.5 w-2.5"
                size={10}
              />
            </div>
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => handleToastClick(activeToast.conversationId)}
          >
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-foreground truncate">
                {activeToast.senderName}
              </h5>
              <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                New Message
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {activeToast.preview}
            </p>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Connection Status Indicator */}
      {connectionStatus !== "connected" && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm text-xs font-medium backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full animate-pulse ${connectionStatus === "reconnecting" ? "bg-amber-500" : "bg-red-500"}`} />
          {connectionStatus === "reconnecting" ? "Reconnecting..." : "Offline (Reconnecting)"}
        </div>
      )}
    </RealtimeContext.Provider>
  );
}
