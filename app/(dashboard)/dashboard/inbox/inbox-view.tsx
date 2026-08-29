"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  RefreshCw,
  User,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { ConversationList } from "@/components/inbox/conversation-list";
import { MessageThread } from "@/components/inbox/message-thread";
import { ContactPanel } from "@/components/inbox/contact-panel";
import { createClient } from "@/lib/supabase/client";
import { soundManager } from "@/lib/sound-notifications";
import { PlatformIcon } from "@/components/platform-icon";
import { useGlobalLiveSync } from "@/components/providers/global-live-sync-provider";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};
type Message = Database["public"]["Tables"]["messages"]["Row"];

export function InboxView({
  conversations: initialConversations,
  workspaceId,
}: {
  conversations: Conversation[];
  workspaceId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conversationId");

  const {
    conversations: globalConversations,
    soundEnabled,
    setSoundEnabled,
    syncNow: globalSyncNow,
    markConversationAsRead,
  } = useGlobalLiveSync();

  const [conversations, setConversations] = useState<Conversation[]>(
    globalConversations.length > 0 ? globalConversations : initialConversations
  );
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Keep in sync with global real-time state
  useEffect(() => {
    if (globalConversations.length > 0) {
      setConversations(globalConversations);
    }
  }, [globalConversations]);

  // Handle conversation selection with instant 0ms optimistic read marking
  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setSelected(conv);
      if (conv.unread_count > 0) {
        markConversationAsRead(conv.id);
      }
    },
    [markConversationAsRead]
  );

  // Handle URL param selection (e.g. clicked from toast or notification)
  useEffect(() => {
    if (targetConvId && conversations.length > 0) {
      const match = conversations.find((c) => c.id === targetConvId);
      if (match && selected?.id !== match.id) {
        handleSelectConversation(match);
      }
    }
  }, [targetConvId, conversations, selected?.id, handleSelectConversation]);

  // If current selected conversation had a new message, refresh it
  useEffect(() => {
    if (selected) {
      const match = conversations.find((c) => c.id === selected.id);
      if (match && match.last_message_at !== selected.last_message_at) {
        setSelected(match);
      }
    }
  }, [conversations, selected]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/v1/messages?conversationId=${selected!.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data ?? []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }

      // Mark as read immediately in 0ms
      if (selected!.unread_count > 0) {
        markConversationAsRead(selected!.id);
      }
    }

    loadMessages();
  }, [selected?.id, selected?.last_message_at, markConversationAsRead]);

  // Request browser desktop notification permission
  function handleEnableNotifications() {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          soundManager.showDesktopNotification("Notifications Enabled", {
            body: "You will receive instant alerts when new messages arrive.",
          });
        }
      });
    }
  }

  // Handle manual sync button
  async function handleManualSync() {
    setSyncing(true);
    try {
      await globalSyncNow();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="relative flex h-full overflow-hidden">

      {/* Left panel: Conversation list */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-background">
        {/* Top Controls: Sound & Notification Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/20 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-colors",
                soundEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
              )}
              title={soundEnabled ? "Mute message chimes" : "Enable message chimes"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="text-[11px] font-medium">{soundEnabled ? "Sound On" : "Muted"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEnableNotifications}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Enable desktop notifications"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin text-primary")} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ConversationList
            conversations={conversations}
            workspaceId={workspaceId}
            selectedId={selected?.id ?? null}
            onSelect={handleSelectConversation}
          />
        </div>
      </div>

      {/* Center panel: Message thread */}
      <div className="flex min-h-0 flex-1 flex-col">
        {selected && !showContactPanel && (
          <div className="flex shrink-0 justify-end border-b border-border px-2 py-1">
            <button
              onClick={() => setShowContactPanel(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Show contact info"
            >
              <User className="h-3.5 w-3.5" />
              Contact info
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-semibold text-foreground">Live Inbox Ready</h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                Connect your social channels. Inbound customer messages from Facebook, Instagram, WhatsApp, X, and Telegram appear here in real-time.
              </p>
              <Link
                href="/dashboard/channels"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Connect Channels
              </Link>
            </div>
          ) : loadingMessages && selected ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <MessageThread
              conversation={selected}
              messages={messages}
            />
          )}
        </div>
      </div>

      {/* Right panel: Contact info */}
      {showContactPanel && selected?.contact_id && (
        <ContactPanel
          contactId={selected.contact_id}
          workspaceId={workspaceId}
          onClose={() => setShowContactPanel(false)}
        />
      )}
    </div>
  );
}
