"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Volume2, VolumeX, Bell } from "lucide-react";
import { soundManager } from "@/lib/sound-notifications";
import { createClient } from "@/lib/supabase/client";
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

interface GlobalLiveSyncContextValue {
  unreadCount: number;
  conversations: Conversation[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  syncNow: () => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
}

const GlobalLiveSyncContext = createContext<GlobalLiveSyncContextValue>({
  unreadCount: 0,
  conversations: [],
  soundEnabled: true,
  setSoundEnabled: () => {},
  syncNow: async () => {},
  markConversationAsRead: async () => {},
});

export function useGlobalLiveSync() {
  return useContext(GlobalLiveSyncContext);
}

export function GlobalLiveSyncProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const prevConversationsRef = useRef<Map<string, { lastMsgAt: string | null; unread: number }>>(
    new Map()
  );
  const notifiedKeysRef = useRef<Set<string>>(new Set());
  const isInitialSyncRef = useRef<boolean>(true);

  // Instant 0ms Optimistic Read Marker
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    // 1. Instant 0ms UI update
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === conversationId);
      const unreadToDeduct = conv?.unread_count || 0;
      if (unreadToDeduct > 0) {
        setUnreadCount((curr) => Math.max(0, curr - unreadToDeduct));
      }
      return prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c));
    });

    const existing = prevConversationsRef.current.get(conversationId);
    if (existing) {
      prevConversationsRef.current.set(conversationId, { ...existing, unread: 0 });
    }

    // 2. Background DB write
    try {
      const supabase = createClient();
      await supabase.from("conversations").update({ unread_count: 0 }).eq("id", conversationId);
    } catch (err) {
      console.warn("[global-sync] markAsRead error:", err);
    }
  }, []);

  // Trigger one-time chime & toast for new incoming message
  const triggerNotification = useCallback(
    (conv: Conversation) => {
      if (soundEnabled) {
        soundManager.playMessageChime();
      }

      const senderName =
        conv.contacts?.display_name ||
        ((conv.contacts?.metadata as any)?.username ? `@${(conv.contacts?.metadata as any).username}` : null) ||
        "Customer";
      const preview = conv.last_message_preview || "New message received";

      setActiveToast({
        id: `toast-${Date.now()}`,
        conversationId: conv.id,
        senderName,
        preview,
        platform: conv.platform,
        avatarUrl: conv.contacts?.avatar_url,
      });

      soundManager.showDesktopNotification(`New message from ${senderName}`, {
        body: preview,
      });

      // Auto dismiss after 4.5s
      setTimeout(() => {
        setActiveToast((curr) => (curr?.conversationId === conv.id ? null : curr));
      }, 4500);
    },
    [soundEnabled]
  );

  // Core Sync Worker
  const syncNow = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/inbox/live-sync?workspaceId=${workspaceId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.conversations) return;

      const freshList: Conversation[] = data.conversations;

      // Stable sort
      const sortedFresh = [...freshList].sort((a, b) => {
        const aTime = new Date(a.last_message_at || a.created_at).getTime();
        const bTime = new Date(b.last_message_at || b.created_at).getTime();
        if (bTime !== aTime) return bTime - aTime;
        return a.id.localeCompare(b.id);
      });

      // Calculate total unread count
      const totalUnread = freshList.reduce((acc, c) => acc + (c.unread_count || 0), 0);

      // Atomic batch update for UI
      setUnreadCount(totalUnread);
      setConversations(sortedFresh);

      const prevMap = prevConversationsRef.current;

      freshList.forEach((fresh) => {
        const key = `${fresh.id}:${fresh.last_message_at || fresh.last_message_preview}`;
        const old = prevMap.get(fresh.id);

        if (!isInitialSyncRef.current && !notifiedKeysRef.current.has(key)) {
          // Genuinely new message arrived
          if (fresh.unread_count > 0 && (fresh.last_message_at !== old?.lastMsgAt || !old)) {
            notifiedKeysRef.current.add(key);
            triggerNotification(fresh);
          }
        }

        notifiedKeysRef.current.add(key);
      });

      // Update ref map
      const newMap = new Map<string, { lastMsgAt: string | null; unread: number }>();
      freshList.forEach((c) => {
        newMap.set(c.id, { lastMsgAt: c.last_message_at, unread: c.unread_count });
      });
      prevConversationsRef.current = newMap;

      if (isInitialSyncRef.current) {
        isInitialSyncRef.current = false;
      }
    } catch (err) {
      console.warn("[global-sync] Sync warning:", err);
    }
  }, [workspaceId, triggerNotification]);

  // Initial Sync & Interval Polling (runs globally across all tabs)
  useEffect(() => {
    syncNow();
    const interval = setInterval(syncNow, 3500);
    return () => clearInterval(interval);
  }, [syncNow]);

  // Realtime Supabase Subscription on Conversations Table
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`global-inbox-live-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const updated = payload.new as Database["public"]["Tables"]["conversations"]["Row"];
            const { data: fullConv } = await supabase
              .from("conversations")
              .select("*, contacts(*)")
              .eq("id", updated.id)
              .single();

            if (fullConv) {
              const typed = fullConv as Conversation;
              const key = `${typed.id}:${typed.last_message_at || typed.last_message_preview}`;
              if (!isInitialSyncRef.current && !notifiedKeysRef.current.has(key) && typed.unread_count > 0) {
                notifiedKeysRef.current.add(key);
                triggerNotification(typed);
              }
              syncNow();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, triggerNotification, syncNow]);

  const handleToastClick = useCallback(
    (conversationId: string) => {
      setActiveToast(null);
      router.push(`/dashboard/inbox?conversationId=${conversationId}`);
    },
    [router]
  );

  return (
    <GlobalLiveSyncContext.Provider
      value={{
        unreadCount,
        conversations,
        soundEnabled,
        setSoundEnabled,
        syncNow,
        markConversationAsRead,
      }}
    >
      {children}

      {/* Global Floating Toast (renders anywhere in the dashboard) */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 flex w-80 sm:w-96 items-center gap-3 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className="relative shrink-0 cursor-pointer"
            onClick={() => handleToastClick(activeToast.conversationId)}
          >
            {activeToast.avatarUrl ? (
              <img
                src={activeToast.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {activeToast.senderName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-background bg-background shadow-xs">
              <PlatformIcon platform={activeToast.platform} className="h-2.5 w-2.5" size={10} />
            </div>
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => handleToastClick(activeToast.conversationId)}
          >
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-foreground truncate">{activeToast.senderName}</h5>
              <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                New Message
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{activeToast.preview}</p>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </GlobalLiveSyncContext.Provider>
  );
}
