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
  BellOff,
  BotOff,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
  channels?: {
    id: string;
    display_name: string | null;
    platform: string;
    username?: string | null;
    profile_picture?: string | null;
    is_active?: boolean;
  } | null;
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

export type ChannelItem = {
  id: string;
  display_name: string | null;
  platform: string;
  username?: string | null;
  profile_picture?: string | null;
  is_active?: boolean;
};

export function ConversationList({
  conversations: _initialConversations,
  channels: propChannels = [],
  workspaceId,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  channels?: ChannelItem[];
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

  // Extract unique channels across propChannels and allConversations
  const availableChannels = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; platform: string; username?: string | null; profilePicture?: string | null }
    >();

    // 1. Seed with verified workspace channels from props
    for (const ch of propChannels) {
      if (ch.id) {
        map.set(ch.id, {
          id: ch.id,
          name: ch.display_name || (ch.username ? `@${ch.username.replace(/^@/, "")}` : "Channel"),
          platform: ch.platform,
          username: ch.username,
          profilePicture: ch.profile_picture,
        });
      }
    }

    // 2. Supplement with any channels found in conversation data
    for (const c of allConversations) {
      if (c.channels?.display_name && c.channel_id && !map.has(c.channel_id)) {
        map.set(c.channel_id, {
          id: c.channel_id,
          name: c.channels.display_name,
          platform: c.platform,
          username: (c.channels as any)?.username,
          profilePicture: (c.channels as any)?.profile_picture,
        });
      }
    }
    return Array.from(map.values());
  }, [propChannels, allConversations]);

  // Channels matching currently active platform tab (or all)
  const channelsForActivePlatform = useMemo(() => {
    if (filters.platform === "all") return availableChannels;
    return availableChannels.filter((ch) => ch.platform === filters.platform);
  }, [availableChannels, filters.platform]);

  // Unread count per channel
  const unreadByChannel = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allConversations) {
      if (c.channel_id && (c.unread_count || 0) > 0) {
        map[c.channel_id] = (map[c.channel_id] || 0) + (c.unread_count || 0);
      }
    }
    return map;
  }, [allConversations]);

  // Total conversations per channel
  const countByChannel = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allConversations) {
      if (c.channel_id) {
        map[c.channel_id] = (map[c.channel_id] || 0) + 1;
      }
    }
    return map;
  }, [allConversations]);

  // ── Right-Click Context Menu State ─────────────────────────────
  const queryClient = useQueryClient();

  const prefetchMessages = useCallback(
    (conversationId: string) => {
      queryClient.prefetchQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
          const res = await fetch(`/api/v1/messages?conversationId=${conversationId}`);
          if (!res.ok) throw new Error("Failed to fetch messages");
          return res.json();
        },
        staleTime: 1000 * 30,
      });
    },
    [queryClient]
  );

  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    conversation: Conversation;
  } | null>(null);

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContextMenu = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="flex h-full w-full max-w-full min-w-0 flex-col border-r border-[var(--border)] bg-[var(--paper)] select-none relative overflow-hidden">
      {/* Right Click Context Menu */}
      {contextMenuState && (
        <ConversationContextMenu
          menuPosition={{ x: contextMenuState.x, y: contextMenuState.y }}
          conversation={contextMenuState.conversation}
          onClose={() => setContextMenuState(null)}
        />
      )}

      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)] shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-[var(--ink)] tracking-tight">
            Live Inbox
          </h2>
          {unreadAll > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white shadow-none ">
              {unreadAll} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadMoreConversations(true)}
            disabled={syncingPlatform}
            className="p-1 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/80 transition-colors disabled:opacity-50"
            title="Sync latest chats from Instagram/Facebook"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncingPlatform && "animate-spin text-primary")} />
          </button>
          <span className="text-xs font-semibold text-[var(--ink-2)]">
            {unreadAll > 0 ? (
              <span className="text-[var(--danger)] font-bold">
                {unreadAll} unread
              </span>
            ) : (
              `${filtered.length} chat${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border)] px-3 py-2 bg-[var(--paper)]/50 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
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
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                isSelected
                  ? "bg-[var(--brand)] text-white shadow-none"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
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
                      : "bg-[var(--danger)] text-white"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Multi-Channel Switcher Bar */}
      {channelsForActivePlatform.length > 1 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)]/25 border-b border-[var(--border)] overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 animate-in fade-in duration-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-2)]/70 shrink-0 select-none">
            {filters.platform === "all" ? "Channels:" : "Pages:"}
          </span>

          {/* All for active scope */}
          <button
            onClick={() => setFilters({ channelId: "all" })}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all shrink-0 cursor-pointer",
              filters.channelId === "all"
                ? "bg-foreground text-background font-bold shadow-xs"
                : "bg-[var(--paper)]/80 hover:bg-[var(--paper)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--border)]"
            )}
          >
            <span>{filters.platform === "all" ? "All Channels" : `All ${filters.platform.toUpperCase()}`}</span>
            <span
              className={cn(
                "px-1 py-0.2 rounded-full text-[9px] font-bold",
                filters.channelId === "all"
                  ? "bg-[var(--paper)]/20 text-background"
                  : "bg-[var(--surface)] text-[var(--ink-2)]"
              )}
            >
              {filters.platform === "all"
                ? allConversations.length
                : allConversations.filter((c) => c.platform === filters.platform).length}
            </span>
          </button>

          {/* Individual Channel Pills */}
          {channelsForActivePlatform.map((ch) => {
            const isSelected = filters.channelId === ch.id;
            const unread = unreadByChannel[ch.id] || 0;
            const count = countByChannel[ch.id] || 0;

            return (
              <button
                key={ch.id}
                onClick={() => setFilters({ channelId: ch.id })}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium transition-all shrink-0 cursor-pointer border",
                  isSelected
                    ? "bg-[var(--paper)] border-primary text-[var(--ink)] font-bold shadow-xs ring-1.5 ring-primary/40"
                    : "bg-[var(--paper)]/80 hover:bg-[var(--paper)] border-[var(--border)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                )}
                title={`Filter to ${ch.name}${ch.username ? ` (@${ch.username.replace(/^@/, "")})` : ""}`}
              >
                {ch.profilePicture ? (
                  <img
                    src={ch.profilePicture}
                    alt=""
                    className="h-3.5 w-3.5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <PlatformIcon platform={ch.platform as any} className="h-3 w-3 shrink-0" size={12} />
                )}
                <span className="truncate max-w-[110px]">{ch.name}</span>
                {unread > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[var(--danger)] text-white ">
                    {unread}
                  </span>
                ) : count > 0 ? (
                  <span className="px-1 py-0.2 rounded-full text-[9px] font-medium bg-[var(--surface)] text-[var(--ink-2)]">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="p-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-2)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-md border border-input bg-[var(--paper)]/80 py-2 pl-9 pr-8 text-xs placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-2)] hover:text-[var(--ink)] p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] shrink-0 gap-1.5 min-w-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 flex-1">
          {["all", "open", "closed", "snoozed", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilters({ status: status as any })}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize transition-all shrink-0",
                filters.status === status
                  ? "bg-[var(--surface)] text-[var(--ink)] font-bold shadow-xs border border-[var(--border)]"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <select
            value={filters.channelId}
            onChange={(e) => setFilters({ channelId: e.target.value })}
            className="text-[10px] font-medium rounded-md border border-input bg-[var(--paper)]/80 hover:bg-[var(--paper)] px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/50 text-[var(--ink)] max-w-[105px] truncate shrink-0 shadow-xs cursor-pointer transition-colors"
            title="Filter by connected page or account"
          >
            <option value="all">
              {filters.platform !== "all"
                ? `All ${filters.platform.toUpperCase()}`
                : "All Channels"}
            </option>
            {channelsForActivePlatform.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
          {filters.channelId !== "all" && (
            <button
              onClick={() => setFilters({ channelId: "all" })}
              className="p-0.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/80 text-[10px]"
              title="Reset channel filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 h-full flex-1 bg-[var(--paper)]/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--ink-2)] mb-4 shadow-sm border border-[var(--border)]">
              <MessageSquare className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-base font-bold text-[var(--ink)]">
              No conversations found
            </p>
            <p className="text-sm text-[var(--ink-2)] mt-2 max-w-[220px] leading-relaxed">
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
                  onMouseEnter={() => prefetchMessages(conversation.id)}
                  onContextMenu={(e) => handleContextMenu(e, conversation)}
                  onTouchStart={(e) => handleTouchStart(e, conversation)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={cn(
                    "flex w-full items-start gap-3 p-3.5 text-left transition-all relative group cursor-pointer",
                    isSelected
                      ? "bg-[var(--surface)] border-l-2 border-[var(--brand)] shadow-xs"
                      : isUnread
                      ? "bg-[var(--surface-2)] hover:bg-primary/[0.08] border-l-2 border-[var(--danger)]"
                      : "hover:bg-[var(--surface-2)] border-l-2 border-transparent"
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
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 " />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p
                              className={cn(
                                "truncate text-xs",
                                isUnread
                                  ? "font-bold text-[var(--ink)]"
                                  : "font-semibold text-[var(--ink-2)]"
                              )}
                            >
                              {contactName}
                            </p>
                            {conversation.contacts?.lead_stage && (
                              <span
                                className={cn(
                                  "shrink-0 rounded-full border px-1.5 py-0.2 text-[9px] font-bold tracking-tight capitalize",
                                  LEAD_STAGES[conversation.contacts.lead_stage]?.badgeClass ||
                                    "bg-[var(--surface)] text-[var(--ink-2)] border-[var(--border)]"
                                )}
                              >
                                {LEAD_STAGES[conversation.contacts.lead_stage]?.label || conversation.contacts.lead_stage}
                              </span>
                            )}
                          </div>
                          {conversation.channels?.display_name && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-[var(--surface)]/80 hover:bg-[var(--surface)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--ink-2)] border border-[var(--border)] max-w-[130px] truncate shrink-0 shadow-2xs"
                                title={`Connected via ${conversation.channels.display_name}`}
                              >
                                {conversation.channels.profile_picture ? (
                                  <img
                                    src={conversation.channels.profile_picture}
                                    alt=""
                                    className="h-2.5 w-2.5 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <PlatformIcon platform={conversation.platform as any} className="h-2.5 w-2.5 shrink-0" size={10} />
                                )}
                                <span className="truncate">{conversation.channels.display_name}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {conversation.is_muted && (
                          <span title="Muted">
                            <BellOff className="h-3 w-3 text-amber-500 shrink-0" />
                          </span>
                        )}
                        {conversation.is_automation_paused && (
                          <span title="AI Bot Paused">
                            <BotOff className="h-3 w-3 text-rose-500 shrink-0" />
                          </span>
                        )}
                        <span
                          suppressHydrationWarning
                          className={cn(
                            "text-[10px]",
                            isUnread
                              ? "font-bold text-[var(--danger)]"
                              : "text-[var(--ink-2)]"
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
                          className="opacity-70 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-opacity cursor-pointer"
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
                            ? "font-semibold text-[var(--ink)]"
                            : "text-[var(--ink-2)]"
                        )}
                      >
                        {conversation.last_message_preview ?? "New conversation"}
                      </p>
                      {isUnread && (
                        <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-none ">
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
          <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)] text-center space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => loadMoreConversations(false)}
              disabled={loadingMore || syncingPlatform}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-[var(--border)] bg-[var(--paper)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] transition-all shadow-2xs disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Loading older chats...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--ink-2)]" />
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
