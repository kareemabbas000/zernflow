"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  User,
  Volume2,
  VolumeX,
  Bell,
  ArrowLeft,
  Sparkles,
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
import { motion, AnimatePresence, Variants } from "framer-motion";

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

  // Mobile Animation Variants
  const slideVariants: Variants = {
    initial: { x: "100%", opacity: 0.9 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", opacity: 0.9, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full min-w-0 overflow-hidden bg-[var(--paper)] font-sans"
    >
      {/* 1. LEFT PANEL: Conversation List */}
      <div
        className={cn(
          "flex flex-col bg-[var(--surface-2)] z-10 border-r border-[var(--border)]",
          // On mobile, if a conversation is selected, hide the list entirely to avoid z-index bleeding.
          // On desktop, it's always visible and fixed width.
          isMobile 
            ? (selectedId ? "hidden" : "absolute inset-0 w-full")
            : "relative w-[340px] xl:w-[380px] shrink-0"
        )}
      >
        {/* Top Controls (Floating Glassmorphism) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]/80 backdrop-blur-xl shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 border",
              soundEnabled
                ? "bg-[var(--brand)] text-white border-[var(--brand)] shadow-lg shadow-[var(--brand)]/20"
                : "bg-transparent text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
            )}
            title={soundEnabled ? "Mute message chimes" : "Enable message chimes"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="text-[11px] font-bold tracking-wide uppercase hidden sm:inline">
              {soundEnabled ? "Sound On" : "Muted"}
            </span>
          </button>

          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[var(--ink-2)] font-bold tracking-wide uppercase text-[11px] border border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-all duration-200"
            title="Enable desktop notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Alerts</span>
          </button>
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

      {/* 2. CENTER PANEL: Message Thread */}
      <AnimatePresence initial={false}>
        {(!isMobile || (isMobile && selectedId && !contactPanelOpen)) && (
          <motion.div
            key="message-thread"
            variants={isMobile ? slideVariants : undefined}
            initial={isMobile ? "initial" : false}
            animate={isMobile ? "animate" : false}
            exit={isMobile ? "exit" : undefined}
            className={cn(
              "flex flex-col flex-1 min-w-0 bg-[var(--paper)] z-20 overflow-hidden",
              isMobile ? "absolute inset-0 w-full" : "relative"
            )}
          >
            {/* Mobile Header for Thread */}
            {isMobile && selectedId && (
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 shrink-0 bg-[var(--surface)]/90 backdrop-blur-xl z-30 shadow-sm">
                <button
                  onClick={() => selectConversation(null)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[var(--ink)] bg-[var(--surface-2)] border border-[var(--border)] shadow-sm active:scale-95 transition-transform"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => setContactPanelOpen(true)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[var(--ink)] bg-[var(--surface-2)] border border-[var(--border)] shadow-sm active:scale-95 transition-transform"
                >
                  <User className="h-4 w-4 text-[var(--brand)]" />
                  Profile
                </button>
              </div>
            )}

            {/* Desktop Contact Panel Toggle */}
            {!isMobile && selectedConversation && !contactPanelOpen && (
              <div className="absolute top-4 right-4 z-30">
                <button
                  onClick={() => setContactPanelOpen(true)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[var(--ink)] bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--border)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <User className="h-4 w-4 text-[var(--brand)]" />
                  Contact Info
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 relative overflow-hidden flex flex-col">
              {displayConversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--brand)] blur-3xl opacity-20 rounded-full" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface)] border border-[var(--border)] shadow-2xl mb-8 transform -rotate-6">
                      <MessageSquare className="h-10 w-10 text-[var(--brand)]" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-[var(--ink)] tracking-tight">
                    Live Inbox Ready
                  </h3>
                  <p className="mt-4 max-w-sm text-sm font-medium text-[var(--ink-2)] leading-relaxed">
                    Your command center is online. Connect your social channels to start receiving inbound messages.
                  </p>
                  <Link
                    href="/dashboard/channels"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[var(--brand)]/20 hover:shadow-2xl hover:bg-[var(--brand-hover)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    Connect Channels
                  </Link>
                </div>
              ) : !selectedConversation ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface-2)] border border-[var(--border)] shadow-sm mb-6">
                    <MessageSquare className="h-8 w-8 text-[var(--ink-3)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--ink)]">
                    No Conversation Selected
                  </h3>
                  <p className="text-sm font-medium text-[var(--ink-2)] mt-2">
                    Choose a chat from the sidebar to view the thread.
                  </p>
                </div>
              ) : messagesLoading && effectiveMessages.length === 0 ? (
                <div className="flex h-full flex-col p-8 space-y-8 justify-end">
                  <div className="flex justify-start">
                    <Skeleton className="h-12 w-2/3 rounded-2xl rounded-bl-sm bg-[var(--surface-2)]" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-12 w-1/2 rounded-2xl rounded-br-sm bg-[var(--brand-soft)]" />
                  </div>
                  <div className="flex justify-start">
                    <Skeleton className="h-24 w-3/4 rounded-2xl rounded-bl-sm bg-[var(--surface-2)]" />
                  </div>
                </div>
              ) : (
                <MessageThread
                  conversation={selectedConversation}
                  messages={effectiveMessages}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. RIGHT PANEL: Contact Info */}
      <AnimatePresence initial={false}>
        {((isMobile && contactPanelOpen) || (!isMobile && contactPanelOpen)) && (
          <motion.div
            key="contact-panel"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "bg-[var(--surface-2)] z-40 border-l border-[var(--border)] flex flex-col shadow-2xl overflow-hidden",
              isMobile
                ? "absolute inset-0 w-full"
                : "relative w-[340px] xl:w-[380px] shrink-0"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
