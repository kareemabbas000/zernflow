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
import { LEAD_STAGE_OPTIONS } from "@/lib/crm";
import { cn } from "@/lib/utils";
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

  const handleSetLeadStage = async (e: React.MouseEvent, stage: string) => {
    e.stopPropagation();
    if (!conversation.contact_id) return;
    
    // Optimistic update in store
    if (conversation.contacts) {
      upsertConversation({
        ...conversation,
        contacts: {
          ...conversation.contacts,
          lead_stage: stage,
        },
      });
    }
    onClose();

    try {
      await fetch(`/api/v1/contacts/${conversation.contact_id}/lead-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStage: stage }),
      });
    } catch (err) {
      console.error("Failed to update lead stage:", err);
    }
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
      <div className="px-3 py-2 border-b border-border/60 text-xs font-bold text-foreground truncate flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{contactName}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono bg-background/80 border border-border/60 px-1 py-0.2 rounded">
            {conversation.platform}
          </span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Quick Action Icon Toolbar (4 Primary Toggles in One Sleek Row) */}
      <div className="grid grid-cols-4 gap-1 p-1.5 border-b border-border/50 bg-muted/10">
        {/* Toggle Read */}
        <button
          type="button"
          onClick={handleToggleRead}
          title={isUnread ? "Mark as Read" : "Mark as Unread"}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          {isUnread ? (
            <CheckCheck className="h-4 w-4 text-blue-500" />
          ) : (
            <Mail className="h-4 w-4 text-rose-500" />
          )}
          <span className="text-[9px] mt-0.5 font-medium">{isUnread ? "Read" : "Unread"}</span>
        </button>

        {/* Toggle Status (Close / Reopen) */}
        <button
          type="button"
          onClick={(e) => handleUpdateStatus(e, conversation.status === "open" ? "closed" : "open")}
          title={conversation.status === "open" ? "Close Chat" : "Reopen Chat"}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          {conversation.status === "open" ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <RotateCcw className="h-4 w-4 text-primary" />
          )}
          <span className="text-[9px] mt-0.5 font-medium">{conversation.status === "open" ? "Close" : "Reopen"}</span>
        </button>

        {/* Toggle Mute */}
        <button
          type="button"
          onClick={handleToggleMute}
          title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-muted transition-all cursor-pointer",
            isMuted ? "text-amber-500 bg-amber-500/10 font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isMuted ? <BellOff className="h-4 w-4 text-amber-500" /> : <Bell className="h-4 w-4" />}
          <span className="text-[9px] mt-0.5 font-medium">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        {/* Toggle AI Automation */}
        <button
          type="button"
          onClick={handleToggleAutomation}
          title={isAutomationPaused ? "Resume AI Bot" : "Pause AI Bot"}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-muted transition-all cursor-pointer",
            isAutomationPaused ? "text-rose-500 bg-rose-500/10 font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isAutomationPaused ? <BotOff className="h-4 w-4 text-rose-500" /> : <Bot className="h-4 w-4 text-emerald-500" />}
          <span className="text-[9px] mt-0.5 font-medium">{isAutomationPaused ? "Resume" : "Pause AI"}</span>
        </button>
      </div>

      {/* CRM Lead Stage Quick Grid */}
      <div className="px-2.5 py-1.5 border-b border-border/50 bg-muted/5">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          <span>Lead Stage</span>
          <span className="capitalize font-semibold text-primary">
            {conversation.contacts?.lead_stage || "lead"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {LEAD_STAGE_OPTIONS.map((opt) => {
            const isCurrent = (conversation.contacts?.lead_stage || "lead") === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => handleSetLeadStage(e, opt.id)}
                className={cn(
                  "flex items-center justify-center gap-1 px-1 py-1 rounded-md text-[9px] font-semibold border transition-all cursor-pointer",
                  isCurrent
                    ? "bg-primary/15 text-primary border-primary/40 shadow-2xs font-bold"
                    : "bg-background/60 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", opt.dot)} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="p-1 space-y-0.5 text-xs">
        <button
          onClick={(e) => handleUpdateStatus(e, "snoozed")}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-muted active:bg-muted transition-colors font-medium cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Snooze Chat</span>
        </button>

        <button
          onClick={(e) => handleUpdateStatus(e, "archived")}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-muted active:bg-muted transition-colors font-medium cursor-pointer"
        >
          <Archive className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>Archive Chat</span>
        </button>

        <button
          onClick={(e) => handleCopy(e, contactName, "name")}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted transition-colors font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Copy className="h-3.5 w-3.5 shrink-0" />
            <span>Copy Name</span>
          </span>
          {copiedText === "name" && <Check className="h-3 w-3 text-emerald-500" />}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 active:bg-rose-500/15 transition-colors font-medium cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" />
          <span>Delete Chat</span>
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
