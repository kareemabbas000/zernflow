"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  Bot,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  RotateCcw,
  Loader2,
  Smile,
  Zap,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import type { Database, ConversationStatus } from "@/lib/types/database";

type Message = Database["public"]["Tables"]["messages"]["Row"] & { is_internal?: boolean };
type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function shouldShowDateSeparator(
  current: Message,
  previous: Message | undefined
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const previousDate = new Date(previous.created_at).toDateString();
  return currentDate !== previousDate;
}

function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === "inbound";
  const isBot = message.sent_by_flow_id !== null;

  return (
    <div
      className={cn(
        "flex gap-2",
        isInbound ? "justify-start" : "justify-end"
      )}
    >
      {isInbound && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}

      <div className="max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isInbound
              ? "rounded-tl-md bg-muted text-foreground"
              : message.is_internal 
                ? "rounded-tr-md bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
                : "rounded-tr-md bg-primary text-primary-foreground"
          )}
        >
          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
          {message.attachments && (
            <div className="mt-1">
              <Paperclip className="inline h-3 w-3" />
              <span className="ml-1 text-xs opacity-70">Attachment</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground",
            isInbound ? "justify-start" : "justify-end"
          )}
        >
          {isBot && <Bot className="h-3 w-3" />}
          <span>{formatMessageTime(message.created_at)}</span>
          {!isInbound && message.status !== "sent" && (
            <span className="capitalize">
              {message.status === "delivered"
                ? "Delivered"
                : message.status === "failed"
                ? "Failed"
                : message.status === "pending"
                ? "Sending..."
                : ""}
            </span>
          )}
        </div>
      </div>

      {!isInbound && !isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      {!isInbound && isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}

export function MessageThread({
  conversation,
  messages: initialMessages,
}: {
  conversation: Conversation | null;
  messages: Message[];
}) {
  const router = useRouter();

  // ── Store integration ────────────────────────────────────────────
  const storeMessages = useInboxStore(
    (s) =>
      conversation?.id
        ? s.messagesByConversation[conversation.id] ?? []
        : []
  );
  const sendMessageToStore = useInboxStore((s) => s.sendMessage);
  const confirmMessage = useInboxStore((s) => s.confirmMessage);
  const failMessage = useInboxStore((s) => s.failMessage);
  const setMessages = useInboxStore((s) => s.setMessages);

  // Use store messages if available, otherwise fall back to initial
  const messages =
    storeMessages.length > 0 ? storeMessages : initialMessages;

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [members, setMembers] = useState<{user_id: string, users: {full_name: string | null}}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch workspace members for assignment
  useEffect(() => {
    if (!conversation?.workspace_id) return;
    const fetchMembers = async () => {
      const { data } = await createClient()
        .from("workspace_members")
        .select("user_id, users(full_name)")
        .eq("workspace_id", conversation.workspace_id);
      if (data) {
        // Handle TS strictness for the join
        const typedData = data.map((d: any) => ({
           user_id: d.user_id,
           users: { full_name: d.users?.full_name || "Unknown" }
        }));
        setMembers(typedData);
      }
    };
    fetchMembers();
  }, [conversation?.workspace_id]);

  const updateAssignee = async (userId: string) => {
    if (!conversation) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/v1/conversations/${conversation.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: userId || null }),
      });
      if (!res.ok) throw new Error("Failed to assign");
    } catch (e) {
      alert("Failed to update assignee");
    } finally {
      setAssigning(false);
    }
  };

  // Seed store from initial server-rendered messages
  useEffect(() => {
    if (conversation?.id && initialMessages.length > 0) {
      setMessages(conversation.id, initialMessages);
    }
  }, [conversation?.id, initialMessages, setMessages]);

  const updateConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      if (!conversation || statusUpdating) return;
      setStatusUpdating(status);
      try {
        const { error } = await createClient()
          .from("conversations")
          .update({ status })
          .eq("id", conversation.id);
        if (error) throw error;
        router.refresh();
      } catch {
        alert(`Failed to update conversation status`);
      } finally {
        setStatusUpdating(null);
      }
    },
    [conversation, statusUpdating, router]
  );

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  }, []);

  const lastConvIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom: instant on conversation open, smooth on new message if near bottom
  useEffect(() => {
    if (!messagesEndRef.current) return;

    if (lastConvIdRef.current !== conversation?.id) {
      lastConvIdRef.current = conversation?.id ?? null;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
      messagesEndRef.current.scrollIntoView({
        behavior: "instant" as ScrollBehavior,
      });
    } else {
      const container = scrollContainerRef.current;
      const isNearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight <
          150
        : true;

      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, conversation?.id]);

  // ── No more polling! Messages arrive via Supabase Realtime → store ────

  async function handleSend() {
    if (!input.trim() || !conversation || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update via store
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: conversation.id,
      direction: "outbound",
      text,
      attachments: null,
      quick_reply_payload: null,
      postback_payload: null,
      callback_data: null,
      platform_message_id: null,
      sent_by_flow_id: null,
      sent_by_node_id: null,
      sent_by_user_id: null,
      status: "pending",
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };
    sendMessageToStore(conversation.id, optimisticMessage);

    try {
      const res = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, text, isInternal }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Send failed (${res.status})`);
      }

      const confirmedMessage: Message = await res.json();
      confirmMessage(conversation.id, optimisticId, confirmedMessage);
    } catch (err) {
      console.error("Failed to send message:", err);
      failMessage(conversation.id, optimisticId);
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Select a conversation
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Choose a conversation from the list to view messages and reply
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {conversation.contacts?.avatar_url ? (
              <img
                src={conversation.contacts.avatar_url}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {conversation.contacts?.display_name?.[0]?.toUpperCase() ??
                  "?"}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-background">
              <PlatformIcon
                platform={conversation.platform}
                className="h-2.5 w-2.5"
                size={10}
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {conversation.contacts?.display_name ?? "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={conversation.assigned_to || ""}
            onChange={(e) => updateAssignee(e.target.value)}
            disabled={assigning}
            className="h-7 w-28 md:w-32 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.users.full_name}</option>
            ))}
          </select>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
              conversation.status === "open"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : conversation.status === "snoozed"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {conversation.status}
          </span>
          {conversation.is_automation_paused && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Bot paused
            </span>
          )}
          <div className="flex items-center gap-1">
            {conversation.status !== "closed" && (
              <button
                onClick={() => updateConversationStatus("closed")}
                disabled={!!statusUpdating}
                title="Close conversation"
                aria-label="Close conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "closed" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {conversation.status !== "snoozed" && (
              <button
                onClick={() => updateConversationStatus("snoozed")}
                disabled={!!statusUpdating}
                title="Snooze conversation"
                aria-label="Snooze conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "snoozed" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {conversation.status !== "open" && (
              <button
                onClick={() => updateConversationStatus("open")}
                disabled={!!statusUpdating}
                title="Reopen conversation"
                aria-label="Reopen conversation"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                {statusUpdating === "open" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message, i) => (
            <div key={message.id}>
              {shouldShowDateSeparator(message, messages[i - 1]) && (
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateSeparator(message.created_at)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <MessageBubble message={message} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background p-3 sm:p-4 shrink-0">
        <div className="mx-auto max-w-3xl rounded-xl border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
          <div className="px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isInternal ? "Type an internal note (only visible to team)..." : "Type your message..."}
              rows={1}
              className={cn("w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none", isInternal ? "text-yellow-700 dark:text-yellow-400 font-medium" : "")}
              style={{ maxHeight: 150 }}
            />
          </div>
          
          <div className="flex items-center justify-between border-t border-border/50 px-2 py-2">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsInternal(!isInternal)}
                className={cn("flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors", isInternal ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : "text-muted-foreground hover:bg-muted")}
              >
                Internal Note {isInternal ? "On" : "Off"}
              </button>
              <div className="ml-2 h-4 w-px bg-border"></div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Attach file or image">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Insert emoji">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Saved replies">
                <Zap className="h-4 w-4" />
              </Button>
              <div className="ml-2 h-4 w-px bg-border"></div>
              <Button variant="ghost" size="sm" className="ml-2 h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10" title="Draft with AI">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">AI Reply</span>
              </Button>
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              size="sm"
              className={cn("h-8 gap-1.5 rounded-lg px-4 font-semibold shadow-none", isInternal ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "")}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  {isInternal ? "Save Note" : "Send"} <Send className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
