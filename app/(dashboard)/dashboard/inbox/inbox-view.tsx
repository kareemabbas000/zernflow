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
      className="relative flex h-full w-full min-w-0 overflow-hidden overflow-x-hidden bg-background"
    >
      {/* Left panel: Conversation list */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-background transition-transform duration-300 ease-in-out absolute inset-0 z-10 md:relative md:w-80 lg:w-84 md:translate-x-0 md:shrink-0 min-w-0 overflow-hidden",
          isMobile && selectedId ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60 bg-muted/20 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                soundEnabled
                  ? "text-primary hover:bg-primary/10 font-semibold"
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
              <span className="text-[11px] hidden sm:inline">
                {soundEnabled ? "Sound On" : "Muted"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Enable desktop notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="text-[11px] hidden sm:inline">Alerts</span>
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

      {/* Center panel: Message thread */}
      <div 
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col bg-background transition-transform duration-300 ease-in-out absolute inset-0 z-20 md:relative md:translate-x-0 overflow-hidden",
          isMobile ? (selectedId && !contactPanelOpen ? "translate-x-0" : selectedId && contactPanelOpen ? "-translate-x-full" : "translate-x-full") : ""
        )}
      >
        {/* Mobile: Back bar */}
        {isMobile && selectedId && (
          <div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0 bg-card">
            <button
              onClick={() => selectConversation(null)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-foreground bg-muted/60 hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to chats</span>
            </button>
            <button
              onClick={() => setContactPanelOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Contact CRM</span>
            </button>
          </div>
        )}

        {/* Desktop: Contact panel toggle */}
        {!isMobile && selectedConversation && !contactPanelOpen && (
          <div className="flex shrink-0 justify-end border-b border-border px-3 py-1.5 bg-background">
            <button
              onClick={() => setContactPanelOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border/50"
              aria-label="Show contact CRM info"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Contact CRM</span>
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
                Select a conversation to view messages
              </p>
            </div>
          ) : messagesLoading && effectiveMessages.length === 0 ? (
            <div className="flex h-full flex-col p-5 space-y-4">
              <div className="flex justify-start">
                <Skeleton className="h-10 w-2/3 rounded-2xl rounded-tl-xs" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-1/2 rounded-2xl rounded-tr-xs bg-primary/20" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-xs" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-8 w-1/3 rounded-2xl rounded-tl-xs" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-12 w-2/3 rounded-2xl rounded-tr-xs bg-primary/20" />
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
          "bg-background transition-all duration-300 ease-in-out absolute inset-0 z-30",
          isMobile
            ? (contactPanelOpen && selectedId ? "translate-x-0" : "translate-x-full")
            : !contactPanelOpen
            ? "hidden"
            : "md:absolute md:inset-y-0 md:right-0 md:z-30 md:w-80 lg:w-84 md:shadow-2xl md:border-l md:border-border xl:relative xl:shadow-none xl:z-auto xl:w-84 xl:shrink-0"
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
