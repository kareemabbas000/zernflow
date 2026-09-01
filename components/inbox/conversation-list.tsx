"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  MessageSquare,
  X,
  Archive,
  Clock,
  CheckCircle,
  RotateCcw,
  Loader2,
  RefreshCw,
  ChevronDown,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import {
  useInboxStore,
  selectConversations,
  selectUnreadByPlatform,
  selectUnreadAll,
} from "@/lib/stores/inbox-store";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import { Avatar } from "@/components/ui/avatar";
import { ConversationContextMenu } from "@/components/inbox/conversation-context-menu";
import { LEAD_STAGES } from "@/lib/crm";
import type { Database, Platform, ConversationStatus } from "@/lib/types/database";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  contacts: Database["public"]["Tables"]["contacts"]["Row"] | null;
  channels?: { id: string; display_name: string; platform: string; is_active: boolean };
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
  conversations: _initialConversations,
  workspaceId,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  workspaceId: string;
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}) {
  // ── Store-powered state ─────────────────────────────────────────
  const filters = useInboxStore((s) => s.filters);
  const setFilters = useInboxStore((s) => s.setFilters);
  const allConversations = useInboxStore(selectConversations);
  const upsertConversation = useInboxStore((s) => s.upsertConversation);

  const filtered = useMemo(() => {
    const { status, platform, channelId, search } = filters;
    return allConversations.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (platform !== "all" && c.platform !== platform) return false;
      if (channelId !== "all" && c.channel_id !== channelId) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = c.contacts?.display_name?.toLowerCase() ?? "";
        const preview = c.last_message_preview?.toLowerCase() ?? "";
        if (!name.includes(q) && !preview.includes(q)) return false;
      }
      return true;
    });
  }, [allConversations, filters]);

  const unreadByPlatform = useInboxStore(selectUnreadByPlatform);
  const unreadAll = useInboxStore(selectUnreadAll);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Right-Click Context Menu State ─────────────────────────────
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    conversation: Conversation;
  } | null>(null);

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContextMenu = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    setContextMenuState({
      x: e.clientX,
      y: e.clientY,
      conversation,
    });
  };

  const handleTouchStart = (e: React.TouchEvent, conversation: Conversation) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    touchTimerRef.current = setTimeout(() => {
      setContextMenuState({
        x: clientX,
        y: clientY,
        conversation,
      });
    }, 450); // 450ms long press
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // ── AJAX Pagination & Deep-Dive Load More ──────────────────────
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState(false);
  const [hasMoreLocal, setHasMoreLocal] = useState(true);

  const loadMoreConversations = useCallback(
    async (fromPlatform: boolean = false) => {
      if (!workspaceId || loadingMore || syncingPlatform) return;

      if (fromPlatform) {
        setSyncingPlatform(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const offset = allConversations.length;
        const res = await fetch(
          `/api/v1/inbox/conversations?workspaceId=${workspaceId}&limit=30&offset=${offset}${
            fromPlatform ? "&syncMore=true" : ""
          }`
        );

        if (!res.ok) throw new Error("Failed to load more");
        const data = await res.json();

        if (data.conversations && Array.isArray(data.conversations)) {
          data.conversations.forEach((conv: Conversation) => {
            upsertConversation(conv);
          });
          setHasMoreLocal(data.hasMore ?? data.conversations.length >= 30);
        }
      } catch (err) {
        console.error("Failed to load more conversations:", err);
      } finally {
        setLoadingMore(false);
        setSyncingPlatform(false);
      }
    },
    [workspaceId, loadingMore, syncingPlatform, allConversations.length, upsertConversation]
  );

  return (
    <div className="flex h-full flex-col border-r border-border bg-background select-none relative">
      {/* Right Click Context Menu */}
      {contextMenuState && (
        <ConversationContextMenu
          menuPosition={{ x: contextMenuState.x, y: contextMenuState.y }}
          conversation={contextMenuState.conversation}
          onClose={() => setContextMenuState(null)}
        />
      )}

      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-foreground tracking-tight">
            Live Inbox
          </h2>
          {unreadAll > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white shadow-sm shadow-rose-500/30 animate-pulse">
              {unreadAll} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadMoreConversations(true)}
            disabled={syncingPlatform}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            title="Sync latest chats from Instagram/Facebook"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncingPlatform && "animate-spin text-primary")} />
          </button>
          <span className="text-xs font-semibold text-muted-foreground">
            {unreadAll > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                {unreadAll} unread
              </span>
            ) : (
              `${filtered.length} chat${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2 bg-background/50 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
        {(
          [
            "all",
            "instagram",
            "facebook",
            "whatsapp",
            "twitter",
            "telegram",
          ] as const
        ).map((plat) => {
          const count =
            plat === "all"
              ? unreadAll
              : unreadByPlatform[plat] || 0;
          const isSelected = filters.platform === plat;

          return (
            <button
              key={plat}
              onClick={() => setFilters({ platform: plat })}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {plat !== "all" && (
                <PlatformIcon
                  platform={plat}
                  className="h-3 w-3"
                  size={12}
                />
              )}
              <span className="capitalize">{plat}</span>
              {count > 0 && (
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
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="p-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-xl border border-input bg-background/80 py-2 pl-9 pr-8 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Status & Channel filter */}
      <div className="flex items-center justify-between px-3 pb-2 shrink-0 gap-2 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 shrink-0">
          {(["all", "open", "closed", "snoozed", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ status: status as any })}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition-all",
                filters.status === status
                  ? "bg-muted text-foreground font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <select
          value={filters.channelId}
          onChange={(e) => setFilters({ channelId: e.target.value })}
          className="text-[10px] rounded-md border border-input bg-background/50 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 text-muted-foreground max-w-[110px] truncate shrink-0"
        >
          <option value="all">All Channels</option>
          {Array.from(
            new Map(
              allConversations
                .filter((c) => c.channels?.display_name)
                .map((c) => [c.channel_id, c.channels?.display_name])
            ).entries()
          ).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No conversations found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              {filters.search
                ? "Try a different search term"
                : filters.status !== "all"
                ? `No ${filters.status} conversations`
                : "New inbound messages will stream here live"}
            </p>
          </div>
        ) : (
          <div className="flex-1">
            {filtered.map((conversation) => {
              const isUnread = (conversation.unread_count || 0) > 0;
              const isSelected = selectedId === conversation.id;
              const contactName = conversation.contacts?.display_name || "Customer";

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  onContextMenu={(e) => handleContextMenu(e, conversation)}
                  onTouchStart={(e) => handleTouchStart(e, conversation)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={cn(
                    "flex w-full items-start gap-3 p-3.5 text-left transition-all relative group cursor-pointer",
                    isSelected
                      ? "bg-primary/10 dark:bg-primary/15 border-l-4 border-l-primary shadow-xs"
                      : isUnread
                      ? "bg-primary/[0.04] dark:bg-primary/[0.08] hover:bg-primary/[0.08] border-l-4 border-l-rose-500"
                      : "hover:bg-muted/50 border-l-4 border-l-transparent"
                  )}
                >
                  {/* Avatar with platform badge */}
                  <Avatar
                    src={conversation.contacts?.avatar_url}
                    name={contactName}
                    platform={conversation.platform as Platform}
                    size="md"
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isUnread && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p
                              className={cn(
                                "truncate text-xs",
                                isUnread
                                  ? "font-bold text-foreground"
                                  : "font-semibold text-foreground/80"
                              )}
                            >
                              {contactName}
                            </p>
                            {conversation.contacts?.lead_stage && (
                              <span
                                className={cn(
                                  "shrink-0 rounded-full border px-1.5 py-0.2 text-[9px] font-bold tracking-tight capitalize",
                                  LEAD_STAGES[conversation.contacts.lead_stage]?.badgeClass ||
                                    "bg-muted text-muted-foreground border-border"
                                )}
                              >
                                {LEAD_STAGES[conversation.contacts.lead_stage]?.label || conversation.contacts.lead_stage}
                              </span>
                            )}
                          </div>
                          {conversation.channels?.display_name && (
                            <span className="text-[9px] text-muted-foreground truncate leading-tight">
                              via {conversation.channels.display_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          suppressHydrationWarning
                          className={cn(
                            "text-[10px]",
                            isUnread
                              ? "font-bold text-rose-600 dark:text-rose-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {mounted
                            ? formatTime(conversation.last_message_at)
                            : ""}
                        </span>

                        {/* 3-dots options button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setContextMenuState({
                              x: rect.left,
                              y: rect.bottom + 4,
                              conversation,
                            });
                          }}
                          className="opacity-70 group-hover:opacity-100 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
                          title="Conversation options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p
                        className={cn(
                          "truncate text-xs leading-relaxed",
                          isUnread
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversation.last_message_preview ?? "New conversation"}
                      </p>
                      {isUnread && (
                        <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm shadow-rose-500/40 animate-pulse">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AJAX Load More / Deep-dive Platform Button */}
        {filtered.length > 0 && (
          <div className="p-3 bg-muted/10 border-t border-border/50 text-center space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => loadMoreConversations(false)}
              disabled={loadingMore || syncingPlatform}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Loading older chats...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Load More Conversations ({allConversations.length})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => loadMoreConversations(true)}
              disabled={syncingPlatform || loadingMore}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3 w-3", syncingPlatform && "animate-spin")} />
              <span>{syncingPlatform ? "Syncing from Meta..." : "Deep-dive: Fetch older chats from platform"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
