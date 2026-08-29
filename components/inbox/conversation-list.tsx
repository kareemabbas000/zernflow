"use client";

import { useState, useEffect } from "react";
import { Search, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import type { Database, Platform, ConversationStatus } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations: initialConversations,
  workspaceId,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  workspaceId: string;
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "all">("open");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");

  const unreadByPlatform = conversations.reduce<Record<string, number>>((acc, conv) => {
    if (conv.unread_count > 0) {
      acc.all = (acc.all || 0) + conv.unread_count;
      acc[conv.platform] = (acc[conv.platform] || 0) + conv.unread_count;
    }
    return acc;
  }, {});

  const filtered = conversations.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (platformFilter !== "all" && c.platform !== platformFilter) return false;
    if (search) {
      const name = c.contacts?.display_name?.toLowerCase() ?? "";
      const preview = c.last_message_preview?.toLowerCase() ?? "";
      const q = search.toLowerCase();
      if (!name.includes(q) && !preview.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground tracking-tight">Live Inbox</h2>
          {unreadByPlatform.all ? (
            <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white shadow-sm shadow-rose-500/30 animate-pulse">
              {unreadByPlatform.all} unread
            </span>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {unreadByPlatform.all ? (
            <span className="text-rose-600 dark:text-rose-400 font-bold">{unreadByPlatform.all} unread message{unreadByPlatform.all !== 1 ? "s" : ""}</span>
          ) : (
            `${filtered.length} conversation${filtered.length !== 1 ? "s" : ""}`
          )}
        </span>
      </div>

      {/* Platform Tabs with Unread Count Badges (clean scrolling with no visible scrollbar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2 bg-background/50 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(["all", "instagram", "facebook", "whatsapp", "twitter", "telegram"] as const).map((plat) => {
          const count = plat === "all" ? unreadByPlatform.all : unreadByPlatform[plat];
          const isSelected = platformFilter === plat;

          return (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {plat !== "all" && <PlatformIcon platform={plat} className="h-3 w-3" size={12} />}
              <span className="capitalize">{plat}</span>
              {count ? (
                <span
                  className={cn(
                    "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black",
                    isSelected
                      ? "bg-white text-primary"
                      : "bg-rose-500 text-white"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/80 py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 px-3 pb-2">
        {(["all", "open", "closed", "snoozed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
              statusFilter === status
                ? "bg-muted text-foreground font-bold shadow-xs border border-border"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No conversations found</p>
            <p className="text-xs text-muted-foreground mt-1">Messages from your connected channels will stream here instantly.</p>
          </div>
        ) : (
          filtered.map((conversation) => {
            const isUnread = conversation.unread_count > 0;
            const isSelected = selectedId === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  "flex w-full items-start gap-3 p-3.5 text-left transition-all relative",
                  isSelected
                    ? "bg-primary/10 dark:bg-primary/15 border-l-4 border-l-primary shadow-xs"
                    : isUnread
                    ? "bg-primary/[0.04] dark:bg-primary/[0.08] hover:bg-primary/[0.08] border-l-4 border-l-rose-500"
                    : "hover:bg-muted/50 border-l-4 border-l-transparent"
                )}
              >
                {/* Avatar with platform badge */}
                <div className="relative flex-shrink-0">
                  {conversation.contacts?.avatar_url ? (
                    <img
                      src={conversation.contacts.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-sm font-bold ring-1 ring-primary/20">
                      {conversation.contacts?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-background bg-background shadow-xs">
                    <PlatformIcon
                      platform={conversation.platform}
                      className="h-3 w-3"
                      size={12}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      {isUnread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                      )}
                      <p
                        className={cn(
                          "truncate text-xs",
                          isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/80"
                        )}
                      >
                        {conversation.contacts?.display_name ?? "Customer"}
                      </p>
                    </div>
                    <span
                      suppressHydrationWarning
                      className={cn(
                        "flex-shrink-0 text-[10px]",
                        isUnread ? "font-bold text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                      )}
                    >
                      {mounted ? formatTime(conversation.last_message_at) : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p
                      className={cn(
                        "truncate text-xs leading-relaxed",
                        isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {conversation.last_message_preview ?? "New message"}
                    </p>
                    {isUnread && (
                      <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm shadow-rose-500/40 animate-pulse">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
