"use client";

import { useState, useEffect, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "next/navigation";
import { Sparkles, PanelRightClose, PanelRightOpen, MessageSquare } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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

  const { markConversationAsRead } = useGlobalLiveSync();

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

  const { data: queryMessages } = useConversationMessages(selectedId);


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
      if (isMobile) {
        setContactPanelOpen(false); // Close panel on mobile when selecting new conversation
      }
    },
    [selectConversation, markConversationAsRead, isMobile, setContactPanelOpen]
  );


  const effectiveMessages = queryMessages || storeMessages;

  return (
    <div className={cn(
      "absolute inset-0 flex w-full bg-[var(--surface-2)] overflow-hidden font-sans",
      isMobile && "pb-16" // Account for the mobile bottom nav so text input isn't hidden
    )}>
      
      {/* 1. LEFT PANE: Native Conversation List */}
      <AnimatePresence>
        {(!isMobile || (isMobile && !selectedId)) && (
          <motion.div
            key="left-pane"
            initial={isMobile ? { x: "-100%" } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: "-100%" } : undefined}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn(
              "flex flex-col bg-[var(--surface-2)] border-r border-[var(--border)] overflow-hidden shrink-0 z-10",
              isMobile ? "absolute inset-0" : "w-[320px]"
            )}
          >
            <ConversationList
              conversations={displayConversations}
              channels={channels}
              workspaceId={workspaceId}
              selectedId={selectedId}
              onSelect={handleSelectConversation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. RIGHT PANE: Message Thread Canvas */}
      <AnimatePresence mode="wait">
        {(!isMobile || (isMobile && selectedId)) && (
          <motion.div
            key="right-pane"
            initial={isMobile ? { x: "100%" } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: "100%" } : undefined}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn(
              "flex flex-col flex-1 min-w-0 bg-[var(--paper)] relative z-20",
              isMobile ? "absolute inset-0" : ""
            )}
          >
            {selectedId ? (
              <div className="flex-1 flex flex-col relative w-full h-full">
                {effectiveMessages ? (
                  <ErrorBoundary fallbackRender={({ error }) => <div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200 max-w-full overflow-auto"><h3 className="font-bold">MessageThread crashed:</h3><pre className="text-xs mt-2">{error.message}</pre><pre className="text-[9px] mt-2 opacity-70">{error.stack}</pre></div></div>}><MessageThread
                    conversation={selectedConversation}
                    messages={effectiveMessages}
                    onOpenProfile={() => setContactPanelOpen(!contactPanelOpen)}
                    isProfileOpen={contactPanelOpen}
                  /></ErrorBoundary>
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--paper)]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-10 w-10 rounded-full border-2 border-[var(--surface-2)] border-t-[var(--brand)] animate-spin" />
                      <p className="text-[var(--ink-2)] text-sm font-medium animate-pulse">Loading thread...</p>
                    </div>
                  </div>
                )}

                {/* OVERLAY: Contact Panel Drawer */}
                <AnimatePresence>
                  {contactPanelOpen && selectedConversation && (
                    <>
                      {/* Mobile Backdrop */}
                      {isMobile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/20 z-40"
                          onClick={() => setContactPanelOpen(false)}
                        />
                      )}
                      
                      <motion.div
                        initial={{ x: "100%", opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0.5 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className={cn(
                          "absolute top-0 bottom-0 right-0 z-50 flex flex-col bg-[var(--surface-2)] shadow-2xl border-l border-[var(--border)] overflow-hidden",
                          isMobile ? "w-full sm:w-[380px]" : "w-[380px]"
                        )}
                      >
                        <ErrorBoundary fallback={<div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200">ContactPanel crashed.</div></div>}><ContactPanel
                          contactId={selectedConversation.contacts?.id!}
                          workspaceId={workspaceId}
                          onClose={() => setContactPanelOpen(false)}
                          isMobile={isMobile}
                        /></ErrorBoundary>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-[var(--paper)] text-[var(--ink-2)] relative overflow-hidden">
                <div className="text-center space-y-4 max-w-sm relative z-10 p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] shadow-inner mb-6">
                    <MessageSquare className="h-8 w-8 text-[var(--ink-3)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--ink)] tracking-tight">Select a conversation</h3>
                  <p className="text-sm text-[var(--ink-2)]">Choose a message from the list on the left to start engaging.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
