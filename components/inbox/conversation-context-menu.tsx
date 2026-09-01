"use client";

import { useEffect, useRef, useState } from "react";
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
  ExternalLink,
  Check,
  X,
  MoreVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useUpdateConversationStatus, useDeleteConversation } from "@/lib/hooks/use-inbox-queries";
import type { Database, Platform } from "@/lib/types/database";

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
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const updateStatusMutation = useUpdateConversationStatus();
  const deleteConversationMutation = useDeleteConversation();
  const markAsRead = useInboxStore((s) => s.markAsRead);
  const upsertConversation = useInboxStore((s) => s.upsertConversation);
  const removeConversationFromStore = useInboxStore((s) => s.removeConversation);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (menuPosition) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuPosition, onClose]);

  if (!menuPosition || !conversation) return null;

  const isUnread = (conversation.unread_count || 0) > 0;
  const isAutomationPaused = conversation.is_automation_paused || false;
  const isMuted = conversation.is_muted || false;
  const contactName = conversation.contacts?.display_name || "Customer";

  // Position calculation for desktop
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const menuWidth = 230;
  const menuHeight = 360;

  const posX = menuPosition.x + menuWidth > viewportWidth ? viewportWidth - menuWidth - 16 : Math.max(16, menuPosition.x);
  const posY = menuPosition.y + menuHeight > viewportHeight ? viewportHeight - menuHeight - 16 : Math.max(16, menuPosition.y);

  const handleToggleRead = async () => {
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

  const handleUpdateStatus = async (status: string) => {
    onClose();
    upsertConversation({ ...conversation, status: status as any });
    await updateStatusMutation.mutateAsync({
      conversationId: conversation.id,
      status,
    });
  };

  const handleToggleAutomation = async () => {
    const supabase = createClient();
    const newVal = !isAutomationPaused;
    upsertConversation({ ...conversation, is_automation_paused: newVal });
    onClose();

    await supabase
      .from("conversations")
      .update({ is_automation_paused: newVal })
      .eq("id", conversation.id);
  };

  const handleToggleMute = async () => {
    const supabase = createClient();
    const newVal = !isMuted;
    upsertConversation({ ...conversation, is_muted: newVal });
    onClose();

    await supabase
      .from("conversations")
      .update({ is_muted: newVal })
      .eq("id", conversation.id);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
      onClose();
    }, 600);
  };

  const handleDelete = async () => {
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
    <>
      {/* Header with Contact Name */}
      <div className="px-3 py-2 border-b border-border/50 text-xs font-bold text-foreground truncate flex items-center justify-between">
        <span className="truncate">{contactName}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
            {conversation.platform}
          </span>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="py-1 space-y-0.5">
        {/* Mark as Read / Unread */}
        <button
          onClick={handleToggleRead}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          {isUnread ? (
            <>
              <CheckCheck className="h-4 w-4 text-blue-500" />
              <span>Mark as Read</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 text-rose-500" />
              <span>Mark as Unread</span>
            </>
          )}
        </button>

        {/* Status Actions */}
        {conversation.status === "open" ? (
          <button
            onClick={() => handleUpdateStatus("closed")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
          >
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span>Mark as Closed</span>
          </button>
        ) : (
          <button
            onClick={() => handleUpdateStatus("open")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-primary hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reopen Chat</span>
          </button>
        )}

        <button
          onClick={() => handleUpdateStatus("snoozed")}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Snooze Chat</span>
        </button>

        <button
          onClick={() => handleUpdateStatus("archived")}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          <Archive className="h-4 w-4 text-indigo-500" />
          <span>Archive Chat</span>
        </button>
      </div>

      <div className="my-1 border-t border-border/50" />

      <div className="py-1 space-y-0.5">
        {/* Pause / Resume Automation */}
        <button
          onClick={handleToggleAutomation}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          {isAutomationPaused ? (
            <>
              <Bot className="h-4 w-4 text-emerald-500" />
              <span>Resume AI & Flows</span>
            </>
          ) : (
            <>
              <BotOff className="h-4 w-4 text-amber-500" />
              <span>Pause AI & Flows</span>
            </>
          )}
        </button>

        {/* Mute Notifications */}
        <button
          onClick={handleToggleMute}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          {isMuted ? (
            <>
              <Bell className="h-4 w-4 text-primary" />
              <span>Unmute Notifications</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 text-muted-foreground" />
              <span>Mute Notifications</span>
            </>
          )}
        </button>
      </div>

      <div className="my-1 border-t border-border/50" />

      <div className="py-1 space-y-0.5">
        {/* Copy Username / ID */}
        <button
          onClick={() => handleCopy(contactName, "name")}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted transition-colors text-xs font-medium"
        >
          <span className="flex items-center gap-2.5">
            <Copy className="h-4 w-4" />
            <span>Copy Name</span>
          </span>
          {copiedText === "name" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            setDeleteConfirm(true);
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors text-xs font-semibold"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Conversation</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        // Mobile Bottom Action Sheet
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            ref={menuRef}
            className="w-full rounded-t-3xl border-t border-border bg-popover p-3 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
            {menuItemsContent}
          </div>
        </div>
      ) : (
        // Desktop Floating Context Menu
        <div
          ref={menuRef}
          style={{ top: posY, left: posX }}
          className="fixed z-50 w-56 rounded-2xl border border-border bg-popover/95 p-1.5 text-xs shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {menuItemsContent}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-foreground">Delete this conversation?</h4>
            <p className="mt-1.5 text-xs text-muted-foreground">
              This will permanently delete the chat history for <strong>{contactName}</strong>.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
