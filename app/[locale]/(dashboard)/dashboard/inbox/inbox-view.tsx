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
  ArrowLeft,
  ChevronRight,
  Wifi,
  Sparkles
} from "lucide-react";
import { ConversationList } from "@/components/inbox/conversation-list";
import { MessageThread } from "@/components/inbox/message-thread";
import { ContactPanel } from "@/components/inbox/contact-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { soundManager } from "@/lib/sound-notifications";
import { useInboxStore, selectSelectedConversation, selectCurrentMessages } from "@/lib/stores/inbox-store";
import { useUIStore, selectIsMobile } from "@/lib/stores/ui-store";
import { useGlobalLiveSync, useRealtime } from "@/components/providers/global-live-sync-provider";
import { useConversationMessages } from "@/lib/hooks/use-inbox-queries";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

export type ChannelInfo = {
  id: string;
  display_name: string | null;
  platform: string;
  username?: string | null;
  profile_picture?: string | null;
  is_active?: boolean;
};

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
  channels?: ChannelInfo | null;
};
type Message = Database["public"]["Tables"]["messages"]["Row"];

export function InboxView({
  conversations: initialConversations,
  workspaceId,
  channels = [],
}: {
  conversations: Conversation[];
  workspaceId: string;
  channels?: ChannelInfo[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conversationId");

  // ── Store & Sync state ──────────────────────────────────────────
  const {
    soundEnabled,
    setSoundEnabled,
    markConversationAsRead,
  } = useGlobalLiveSync();
  const { connectionStatus } = useRealtime();

  const conversations = useInboxStore((s) => s.conversations);
  const selectedId = useInboxStore((s) => s.selectedConversationId);
  const selectedConversation = useInboxStore(selectSelectedConversation);
  const storeMessages = useInboxStore(selectCurrentMessages);
  const selectConversation = useInboxStore((s) => s.selectConversation);
  const setConversations = useInboxStore((s) => s.setConversations);
  const setMessages = useInboxStore((s) => s.setMessages);
  const conversationsLoaded = useInboxStore((s) => s.conversationsLoaded);

  const isMobile = useUIStore(selectIsMobile);
  const contactPanelOpen = useUIStore((s) => s.contactPanelOpen);
  const setContactPanelOpen = useUIStore((s) => s.setContactPanelOpen);

  // TanStack Query for messages
  const { data: queryMessages, isLoading: messagesLoading } = useConversationMessages(selectedId);

  // Sync query messages to store for global Realtime listeners
  useEffect(() => {
    if (selectedId && queryMessages) {
      setMessages(selectedId, queryMessages);
    }
  }, [selectedId, queryMessages, setMessages]);

  // Seed store from server-rendered data if store is empty
  useEffect(() => {
    if (!conversationsLoaded && initialConversations.length > 0) {
      setConversations(initialConversations);
    }
  }, [initialConversations, conversationsLoaded, setConversations]);

  // Live conversations fallback
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

  // Handle URL param selection
  useEffect(() => {
    if (targetConvId && displayConversations.length > 0) {
      const match = displayConversations.find((c) => c.id === targetConvId);
      if (match && selectedId !== match.id) {
        handleSelectConversation(match);
      }
    }
  }, [targetConvId, displayConversations, selectedId, handleSelectConversation]);

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

  // Prevent horizontal scrolling on inbox root container from trackpad gestures
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventHorizontalScroll = () => {
      if (el.scrollLeft !== 0) {
        el.scrollLeft = 0;
      }
    };
    el.addEventListener("scroll", preventHorizontalScroll);
    return () => el.removeEventListener("scroll", preventHorizontalScroll);
  }, []);

  const effectiveMessages = queryMessages || storeMessages;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-w-0 overflow-hidden overflow-x-hidden bg-[var(--paper)] font-sans"
    >
      {/* Left panel: Conversation list */}
      <div
        className={cn(
          "flex flex-col border-r border-[var(--border)] bg-[var(--surface-2)] transition-transform duration-300 ease-in-out absolute inset-0 z-10 md:relative md:w-80 lg:w-96 md:translate-x-0 md:shrink-0 min-w-0 overflow-hidden",
          isMobile && selectedId ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                soundEnabled
                  ? "text-[var(--brand)] bg-[var(--brand-soft)] font-medium"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)] font-medium"
              )}
              title={
                soundEnabled
                  ? "Mute message chimes"
                  : "Enable message chimes"
              }
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <span className="text-[11px] hidden sm:inline">
                {soundEnabled ? "Sound On" : "Muted"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[var(--ink-2)] font-medium hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Enable desktop notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="text-[11px] hidden sm:inline">Alerts</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-[var(--surface-2)]">
          <ConversationList
            conversations={displayConversations}
            channels={channels}
            workspaceId={workspaceId}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        </div>
      </div>

      {/* Center panel: Message thread */}
      <div 
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--paper)] transition-transform duration-300 ease-in-out absolute inset-0 z-20 md:relative md:translate-x-0 overflow-hidden",
          isMobile ? (selectedId && !contactPanelOpen ? "translate-x-0" : selectedId && contactPanelOpen ? "-translate-x-full" : "translate-x-full") : ""
        )}
      >
        {/* Mobile: Back bar */}
        {isMobile && selectedId && (
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 shrink-0 bg-[var(--surface)]">
            <button
              onClick={() => selectConversation(null)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setContactPanelOpen(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Contact</span>
            </button>
          </div>
        )}

        {/* Desktop: Contact panel toggle */}
        {!isMobile && selectedConversation && !contactPanelOpen && (
          <div className="flex shrink-0 justify-end border-b border-[var(--border)] px-4 py-2 bg-[var(--paper)]">
            <button
              onClick={() => setContactPanelOpen(true)}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors border border-[var(--border)]"
              aria-label="Show contact CRM info"
            >
              <User className="h-4 w-4 text-[var(--brand)]" />
              <span>Contact Profile</span>
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 relative overflow-hidden flex flex-col">
          {displayConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center animate-in fade-in duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border)] mb-6">
                <MessageSquare className="h-8 w-8 text-[var(--ink-3)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                Live Inbox Ready
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--ink-2)] leading-relaxed">
                Connect your social channels to see inbound messages here.
              </p>
              <Link
                href="/dashboard/channels"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
              >
                Connect Channels
              </Link>
            </div>
          ) : !selectedConversation ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[var(--ink-2)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--surface-2)] border border-[var(--border)] mb-4">
                <MessageSquare className="h-8 w-8 text-[var(--ink-3)]" />
              </div>
              <p className="text-base font-bold text-[var(--ink)]">
                Select a conversation
              </p>
              <p className="text-sm mt-1">
                Choose a chat from the left to view messages
              </p>
            </div>
          ) : messagesLoading && effectiveMessages.length === 0 ? (
            <div className="flex h-full flex-col p-6 space-y-6">
              <div className="flex justify-start">
                <Skeleton className="h-12 w-2/3 rounded-lg bg-[var(--surface-2)]" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-12 w-1/2 rounded-lg bg-[var(--brand-soft)]" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-20 w-3/4 rounded-lg bg-[var(--surface-2)]" />
              </div>
            </div>
          ) : (
            <MessageThread
              conversation={selectedConversation}
              messages={effectiveMessages}
            />
          )}
        </div>
      </div>

      {/* Right panel: Contact info */}
      <div
        className={cn(
          "bg-[var(--surface-2)] transition-all duration-300 ease-in-out absolute inset-0 z-30 border-l border-[var(--border)]",
          isMobile
            ? (contactPanelOpen && selectedId ? "translate-x-0" : "translate-x-full")
            : !contactPanelOpen
            ? "hidden"
            : "md:absolute md:inset-y-0 md:right-0 md:z-30 md:w-80 lg:w-[360px] md:shadow-xl xl:relative xl:shadow-none xl:z-auto xl:w-[360px] xl:shrink-0"
        )}
      >
        {selectedConversation?.contact_id && (
          <ContactPanel
            contactId={selectedConversation.contact_id}
            workspaceId={workspaceId}
            onClose={() => setContactPanelOpen(false)}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}
