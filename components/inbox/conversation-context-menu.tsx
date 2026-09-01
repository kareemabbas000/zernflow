"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCheck,
  Mail,
  CheckCircle,
  RotateCcw,
  Clock,
  Archive,
  Bot,
  BotOff,
  Bell,
  BellOff,
  Copy,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useUpdateConversationStatus, useDeleteConversation } from "@/lib/hooks/use-inbox-queries";
import type { Database } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
  channels?: { id: string; display_name: string; platform: string; is_active: boolean };
};

export function ConversationContextMenu({
  menuPosition,
  conversation,
  onClose,
  onDeleted,
}: {
  menuPosition: { x: number; y: number } | null;
  conversation: Conversation | null;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updateStatusMutation = useUpdateConversationStatus();
  const deleteConversationMutation = useDeleteConversation();
  const markAsRead = useInboxStore((s) => s.markAsRead);
  const upsertConversation = useInboxStore((s) => s.upsertConversation);
  const removeConversationFromStore = useInboxStore((s) => s.removeConversation);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (menuPosition) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuPosition, onClose]);

  if (!mounted || !menuPosition || !conversation) return null;

  const isUnread = (conversation.unread_count || 0) > 0;
  const isAutomationPaused = conversation.is_automation_paused || false;
  const isMuted = conversation.is_muted || false;
  const contactName = conversation.contacts?.display_name || "Customer";

  // Position calculation for desktop
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const menuWidth = 240;
  const menuHeight = 370;

  const posX = menuPosition.x + menuWidth > viewportWidth ? viewportWidth - menuWidth - 20 : Math.max(20, menuPosition.x);
  const posY = menuPosition.y + menuHeight > viewportHeight ? viewportHeight - menuHeight - 20 : Math.max(20, menuPosition.y);

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const newCount = isUnread ? 0 : 1;
    if (newCount === 0) {
      markAsRead(conversation.id);
    } else {
      upsertConversation({ ...conversation, unread_count: 1 });
    }
    onClose();

    await supabase
      .from("conversations")
      .update({ unread_count: newCount })
      .eq("id", conversation.id);
  };

  const handleUpdateStatus = async (e: React.MouseEvent, status: string) => {
    e.stopPropagation();
    onClose();
    upsertConversation({ ...conversation, status: status as any });
    await updateStatusMutation.mutateAsync({
      conversationId: conversation.id,
      status,
    });
  };

  const handleToggleAutomation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const newVal = !isAutomationPaused;
    upsertConversation({ ...conversation, is_automation_paused: newVal });
    onClose();

    await supabase
      .from("conversations")
      .update({ is_automation_paused: newVal })
      .eq("id", conversation.id);
  };

  const handleToggleMute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const newVal = !isMuted;
    upsertConversation({ ...conversation, is_muted: newVal });
    onClose();

    await supabase
      .from("conversations")
      .update({ is_muted: newVal })
      .eq("id", conversation.id);
  };

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
      onClose();
    }, 600);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversationMutation.mutateAsync(conversation.id);
      removeConversationFromStore(conversation.id);
      if (onDeleted) onDeleted(conversation.id);
      onClose();
    } catch {
      alert("Failed to delete conversation");
    }
  };

  const menuItemsContent = (
    <div onClick={(e) => e.stopPropagation()} className="w-full">
      {/* Header with Contact Name */}
      <div className="px-3.5 py-2.5 border-b border-border/60 text-xs font-bold text-foreground truncate flex items-center justify-between bg-muted/20">
        <span className="truncate">{contactName}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
            {conversation.platform}
          </span>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-1.5 space-y-0.5">
        {/* Mark as Read / Unread */}
        <button
          onClick={handleToggleRead}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          {isUnread ? (
            <>
              <CheckCheck className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Mark as Read</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Mark as Unread</span>
            </>
          )}
        </button>

        {/* Status Actions */}
        {conversation.status === "open" ? (
          <button
            onClick={(e) => handleUpdateStatus(e, "closed")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>Mark as Closed</span>
          </button>
        ) : (
          <button
            onClick={(e) => handleUpdateStatus(e, "open")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-primary hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Reopen Chat</span>
          </button>
        )}

        <button
          onClick={(e) => handleUpdateStatus(e, "snoozed")}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Snooze Chat</span>
        </button>

        <button
          onClick={(e) => handleUpdateStatus(e, "archived")}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          <Archive className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>Archive Chat</span>
        </button>
      </div>

      <div className="my-1 border-t border-border/50" />

      <div className="p-1.5 space-y-0.5">
        {/* Pause / Resume Automation */}
        <button
          onClick={handleToggleAutomation}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          {isAutomationPaused ? (
            <>
              <Bot className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Resume AI & Flows</span>
            </>
          ) : (
            <>
              <BotOff className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Pause AI & Flows</span>
            </>
          )}
        </button>

        {/* Mute Notifications */}
        <button
          onClick={handleToggleMute}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          {isMuted ? (
            <>
              <Bell className="h-4 w-4 text-primary shrink-0" />
              <span>Unmute Notifications</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Mute Notifications</span>
            </>
          )}
        </button>
      </div>

      <div className="my-1 border-t border-border/50" />

      <div className="p-1.5 space-y-0.5">
        {/* Copy Username / ID */}
        <button
          onClick={(e) => handleCopy(e, contactName, "name")}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Copy className="h-4 w-4 shrink-0" />
            <span>Copy Name</span>
          </span>
          {copiedText === "name" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(true);
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="h-4 w-4 shrink-0" />
          <span>Delete Conversation</span>
        </button>
      </div>
    </div>
  );

  return createPortal(
    <>
      {/* Full-screen backdrop to safely capture clicks outside without race conditions */}
      <div
        className="fixed inset-0 z-[99998] bg-black/20 sm:bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      {isMobile ? (
        // Mobile Bottom Action Sheet
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end pointer-events-none"
        >
          <div
            className="w-full pointer-events-auto rounded-t-3xl border-t border-border bg-popover/98 p-2 pb-8 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-200"
          >
            <div className="mx-auto mb-2 mt-1 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            {menuItemsContent}
          </div>
        </div>
      ) : (
        // Desktop Floating Context Menu
        <div
          style={{ top: posY, left: posX }}
          className="fixed z-[99999] w-60 rounded-2xl border border-border bg-popover/95 p-1 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {menuItemsContent}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-foreground">Delete this conversation?</h4>
            <p className="mt-1.5 text-xs text-muted-foreground">
              This will permanently delete the chat history for <strong>{contactName}</strong>.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(false);
                }}
                className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
