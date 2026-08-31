"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  RefreshCw,
  User,
  Volume2,
  VolumeX,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { ConversationList } from "@/components/inbox/conversation-list";
import { MessageThread } from "@/components/inbox/message-thread";
import { ContactPanel } from "@/components/inbox/contact-panel";
import { createClient } from "@/lib/supabase/client";
import { soundManager } from "@/lib/sound-notifications";
import { useInboxStore, selectSelectedConversation, selectCurrentMessages } from "@/lib/stores/inbox-store";
import { useUIStore, selectIsMobile } from "@/lib/stores/ui-store";
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

  // ── Store state ─────────────────────────────────────────────────
  const {
    soundEnabled,
    setSoundEnabled,
    markConversationAsRead,
  } = useGlobalLiveSync();

  const conversations = useInboxStore((s) => s.conversations);
  const selectedId = useInboxStore((s) => s.selectedConversationId);
  const selectedConversation = useInboxStore(selectSelectedConversation);
  const messages = useInboxStore(selectCurrentMessages);
  const messagesLoading = useInboxStore((s) => s.messagesLoading);
  const selectConversation = useInboxStore((s) => s.selectConversation);
  const setConversations = useInboxStore((s) => s.setConversations);
  const setMessages = useInboxStore((s) => s.setMessages);
  const setMessagesLoading = useInboxStore((s) => s.setMessagesLoading);
  const conversationsLoaded = useInboxStore((s) => s.conversationsLoaded);

  const isMobile = useUIStore(selectIsMobile);
  const contactPanelOpen = useUIStore((s) => s.contactPanelOpen);
  const setContactPanelOpen = useUIStore((s) => s.setContactPanelOpen);

  // Seed store from server-rendered data if store is empty
  useEffect(() => {
    if (!conversationsLoaded && initialConversations.length > 0) {
      setConversations(initialConversations);
    }
  }, [initialConversations, conversationsLoaded, setConversations]);

  // Use live conversations, fall back to initial if store hasn't loaded yet
  const displayConversations =
    conversations.length > 0 ? conversations : initialConversations;

  // Handle conversation selection with optimistic read marking
  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      selectConversation(conv.id);
      if (conv.unread_count > 0) {
        markConversationAsRead(conv.id);
      }
    },
    [selectConversation, markConversationAsRead]
  );

  // Handle URL param selection (e.g. clicked from toast or notification)
  useEffect(() => {
    if (targetConvId && displayConversations.length > 0) {
      const match = displayConversations.find((c) => c.id === targetConvId);
      if (match && selectedId !== match.id) {
        handleSelectConversation(match);
      }
    }
  }, [targetConvId, displayConversations, selectedId, handleSelectConversation]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;

    // Check if we already have messages in the store
    const existing = useInboxStore.getState().messagesByConversation[selectedId];
    if (existing && existing.length > 0) {
      // Already have cached messages — no loading state needed
    } else {
      setMessagesLoading(true);
    }

    async function loadMessages() {
      try {
        const res = await fetch(`/api/v1/messages?conversationId=${selectedId}`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(selectedId!, data ?? []);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    }

    loadMessages();
  }, [selectedId, setMessages, setMessagesLoading]);

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

  // ── Mobile: Show conversation list OR thread (not both) ────────
  const showList = !isMobile || !selectedId;
  const showThread = !isMobile || !!selectedId;

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Left panel: Conversation list */}
      {showList && (
        <div
          className={cn(
            "flex flex-col border-r border-border bg-background",
            isMobile ? "w-full" : "w-80 flex-shrink-0"
          )}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/20 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md transition-colors",
                  soundEnabled
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title={
                  soundEnabled
                    ? "Mute message chimes"
                    : "Enable message chimes"
                }
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {soundEnabled ? "Sound On" : "Muted"}
                </span>
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
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ConversationList
              conversations={displayConversations}
              workspaceId={workspaceId}
              selectedId={selectedId}
              onSelect={handleSelectConversation}
            />
          </div>
        </div>
      )}

      {/* Center panel: Message thread */}
      {showThread && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Mobile: Back button */}
          {isMobile && selectedId && (
            <div className="flex items-center border-b border-border px-2 py-1 shrink-0">
              <button
                onClick={() => selectConversation(null)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </div>
          )}

          {/* Desktop: Contact panel toggle */}
          {!isMobile && selectedConversation && !contactPanelOpen && (
            <div className="flex shrink-0 justify-end border-b border-border px-2 py-1">
              <button
                onClick={() => setContactPanelOpen(true)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Show contact info"
              >
                <User className="h-3.5 w-3.5" />
                Contact info
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1">
            {displayConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Live Inbox Ready
                </h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                  Connect your social channels. Inbound customer messages from
                  Facebook, Instagram, WhatsApp, X, and Telegram appear here in
                  real-time.
                </p>
                <Link
                  href="/dashboard/channels"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
                >
                  Connect Channels
                </Link>
              </div>
            ) : !selectedConversation ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-muted-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
                  <MessageSquare className="h-8 w-8 opacity-30" />
                </div>
                <p className="text-sm font-medium">
                  Select a conversation to start messaging
                </p>
              </div>
            ) : messagesLoading && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <MessageThread
                conversation={selectedConversation}
                messages={messages}
              />
            )}
          </div>
        </div>
      )}

      {/* Right panel: Contact info (hidden on mobile) */}
      {!isMobile &&
        contactPanelOpen &&
        selectedConversation?.contact_id && (
          <ContactPanel
            contactId={selectedConversation.contact_id}
            workspaceId={workspaceId}
            onClose={() => setContactPanelOpen(false)}
          />
        )}
    </div>
  );
}
