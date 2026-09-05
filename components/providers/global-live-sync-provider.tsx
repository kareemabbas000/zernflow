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
import { toast } from "sonner";
import { NotificationToast } from "@/components/inbox/notification-toast";
import { createClient } from "@/lib/supabase/client";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { soundManager } from "@/lib/sound-notifications";
import { PlatformIcon } from "@/components/platform-icon";
import type { Database, Platform } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};

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
        toast.custom((t) => (
          <NotificationToast
            toastId={t}
            senderName={senderName}
            preview={preview}
            platform={(conv.platform as Platform) || "instagram"}
            avatarUrl={conv.contacts?.avatar_url}
            onDismiss={() => toast.dismiss(t)}
            onClick={() => {
              toast.dismiss(t);
              router.push(`/dashboard/inbox?conversationId=${conv.id}`);
            }}
          />
        ), {
          duration: 5000,
        });
      }

      soundManager.showDesktopNotification(`New message from ${senderName}`, {
        body: preview,
      });
    },
    [soundEnabled, router]
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

            const { conversations } = useInboxStore.getState();
            const exists = conversations.find(c => c.id === updated.id);

            let typed: Conversation;

            // Only fetch full conversation with joins if it's a completely new conversation we don't have yet
            if (!exists) {
              const { data: fullConv } = await supabase
                .from("conversations")
                .select("*, contacts(*), channels(*)")
                .eq("id", updated.id)
                .single();
              
              if (!fullConv) return;
              typed = fullConv as Conversation;
            } else {
              typed = updated as Conversation;
            }

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
            
            // Note: We deliberately removed the redundant fetch(/api/v1/messages) here.
            // The 'messages' INSERT listener below optimally handles appending new messages to the thread.
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

  return (
    <RealtimeContext.Provider value={{ workspaceId, connectionStatus }}>
      {children}

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
