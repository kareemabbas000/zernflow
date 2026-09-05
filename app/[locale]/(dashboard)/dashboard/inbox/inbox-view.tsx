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
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("conversationId");

  const { soundEnabled, setSoundEnabled, markConversationAsRead } = useGlobalLiveSync();
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

  const { data: queryMessages, isLoading: messagesLoading } = useConversationMessages(selectedId);

  useEffect(() => {
    if (selectedId && queryMessages) {
      setMessages(selectedId, queryMessages);
    }
  }, [selectedId, queryMessages, setMessages]);

  useEffect(() => {
    if (!conversationsLoaded && initialConversations.length > 0) {
      setConversations(initialConversations);
    }
  }, [initialConversations, conversationsLoaded, setConversations]);

  const displayConversations = conversations.length > 0 ? conversations : initialConversations;

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      selectConversation(conv.id);
      if (conv.unread_count > 0) {
        markConversationAsRead(conv.id);
      }
    },
    [selectConversation, markConversationAsRead]
  );

  useEffect(() => {
    if (targetConvId && displayConversations.length > 0) {
      const match = displayConversations.find((c) => c.id === targetConvId);
      if (match && selectedId !== match.id) {
        handleSelectConversation(match);
      }
    }
  }, [targetConvId, displayConversations, selectedId, handleSelectConversation]);

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

  const effectiveMessages = queryMessages || storeMessages;

  const slideVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative flex h-[calc(100vh-70px)] w-full min-w-0 overflow-hidden bg-[var(--surface-2)] p-2 sm:p-4 gap-4 font-sans">
      
      {/* 1. LEFT PANEL: Conversation List (Floating Island) */}
      <AnimatePresence>
        {(!isMobile || (isMobile && !selectedId)) && (
          <motion.div
            key="conversation-list"
            initial={isMobile ? { x: -100, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -100, opacity: 0 } : undefined}
            className={cn(
              "flex flex-col bg-[var(--paper)] shadow-xl shadow-black/5 rounded-[2rem] border border-[var(--border)] overflow-hidden z-10 shrink-0 transition-all",
              isMobile ? "absolute inset-4" : "w-[360px] xl:w-[400px]"
            )}
          >
            <div className="flex-1 min-h-0">
              <ConversationList
                conversations={displayConversations}
                channels={channels}
                workspaceId={workspaceId}
                selectedId={selectedId}
                onSelect={handleSelectConversation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CENTER PANEL: Message Thread (Floating Island) */}
      <AnimatePresence mode="wait">
        {(!isMobile || (isMobile && selectedId)) && (
          <motion.div
            key="message-thread-container"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "flex flex-col flex-1 min-w-0 bg-[var(--paper)] shadow-2xl shadow-black/10 rounded-[2rem] border border-[var(--border)] relative overflow-hidden z-20",
              isMobile ? "absolute inset-4" : ""
            )}
          >
            {/* Thread Container */}
            {selectedId ? (
              <div className="flex-1 min-h-0 flex flex-col relative">
                {effectiveMessages ? (
                  <MessageThread
                    conversation={selectedConversation}
                    messages={effectiveMessages}
                    workspaceId={workspaceId}
                    onBack={isMobile ? () => selectConversation(null) : undefined}
                    onOpenProfile={() => setContactPanelOpen(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--paper)]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 rounded-full border-4 border-[var(--surface-2)] border-t-[var(--brand)] animate-spin" />
                      <p className="text-[var(--ink-2)] text-sm font-bold animate-pulse">Decrypting thread...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-[var(--paper)] text-[var(--ink-2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent pointer-events-none" />
                <div className="text-center space-y-6 max-w-md relative z-10 p-8">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-[var(--brand)] to-blue-400 shadow-2xl shadow-[var(--brand)]/20 rotate-3 hover:rotate-6 transition-all duration-500">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[var(--ink)] tracking-tight mb-2">Intelligence Hub</h3>
                    <p className="text-base text-[var(--ink-2)] font-medium">Select a conversation from the left to start engaging with your customers.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. RIGHT PANEL: Contact Panel (Floating Island) */}
      <AnimatePresence>
        {contactPanelOpen && selectedConversation && (!isMobile || (isMobile && selectedId)) && (
          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className={cn(
              "flex flex-col bg-[var(--paper)] shadow-2xl shadow-black/10 rounded-[2rem] border border-[var(--border)] overflow-hidden z-30 shrink-0",
              isMobile ? "absolute inset-4" : "w-[340px] xl:w-[380px]"
            )}
          >
            <ContactPanel
              contactId={selectedConversation.contacts?.id!}
              conversationId={selectedConversation.id}
              workspaceId={workspaceId}
              onClose={() => setContactPanelOpen(false)}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
