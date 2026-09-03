/**
 * Inbox Store — Zustand-based centralized state for conversations & messages.
 *
 * Replaces:
 * - The 6s polling in global-live-sync-provider
 * - The 3s polling in message-thread
 * - Module-level messageMemoryCache Map in inbox-view
 * - Redundant useState/useEffect chains across 4 components
 *
 * Data flow:
 *   Supabase Realtime → store.handleRealtimeEvent() → React re-renders via selectors
 *   User action → store.sendMessage() → optimistic update + API call
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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
type Message = Database["public"]["Tables"]["messages"]["Row"];

interface InboxFilters {
  status: ConversationStatus | "all";
  platform: Platform | "all";
  channelId: string | "all";
  search: string;
}

interface InboxState {
  // ── Conversations ─────────────────────────────────────────────
  conversations: Conversation[];
  selectedConversationId: string | null;
  unreadCount: number;
  unreadByPlatform: Record<string, number>;
  filters: InboxFilters;
  conversationsLoaded: boolean;

  // ── Messages ──────────────────────────────────────────────────
  /** Messages keyed by conversation ID for instant thread switching. */
  messagesByConversation: Record<string, Message[]>;
  messagesLoading: boolean;

  // ── Actions ───────────────────────────────────────────────────
  setConversations: (conversations: Conversation[], globalCounts?: { all: number; by_platform: Record<string, number> }) => void;
  selectConversation: (id: string | null) => void;
  setFilters: (filters: Partial<InboxFilters>) => void;

  // Realtime handlers
  upsertConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;

  // Optimistic operations
  markAsRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, optimisticMessage: Message) => void;
  confirmMessage: (conversationId: string, optimisticId: string, confirmed: Message) => void;
  failMessage: (conversationId: string, optimisticId: string) => void;

  // Bulk state
  setMessagesLoading: (loading: boolean) => void;
}

export const useInboxStore = create<InboxState>()(
  subscribeWithSelector((set, get) => ({
    // ── Initial State ─────────────────────────────────────────────
    conversations: [],
    selectedConversationId: null,
    unreadCount: 0,
    unreadByPlatform: {},
    filters: { status: "open", platform: "all", channelId: "all", search: "" },
    conversationsLoaded: false,

    messagesByConversation: {},
    messagesLoading: false,

    // ── Conversation Actions ────────────────────────────────────────

    setConversations: (conversations, globalCounts) => {
      const sorted = sortConversations(conversations);
      let unread = 0;
      let byPlatform: Record<string, number> = {};

      if (globalCounts) {
        unread = globalCounts.all;
        byPlatform = globalCounts.by_platform;
      } else {
        // Fallback if not provided
        unread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
        conversations.forEach((c) => {
          if (c.unread_count) {
            byPlatform[c.platform] = (byPlatform[c.platform] || 0) + c.unread_count;
          }
        });
      }

      set({ conversations: sorted, unreadCount: unread, unreadByPlatform: byPlatform, conversationsLoaded: true });
    },

    selectConversation: (id) => {
      set({ selectedConversationId: id });
    },

    setFilters: (partial) => {
      set((state) => ({
        filters: { ...state.filters, ...partial },
      }));
    },

    upsertConversation: (conversation) => {
      set((state) => {
        const existing = state.conversations.find((c) => c.id === conversation.id);
        const nextList = existing
          ? state.conversations.map((c) =>
              c.id === conversation.id ? conversation : c
            )
          : [conversation, ...state.conversations];
        const sorted = sortConversations(nextList);

        // Calculate delta for global counts
        const oldUnread = existing?.unread_count || 0;
        const newUnread = conversation.unread_count || 0;
        const delta = newUnread - oldUnread;
        
        let nextUnreadCount = state.unreadCount;
        let nextUnreadByPlatform = { ...state.unreadByPlatform };

        if (delta !== 0) {
          nextUnreadCount = Math.max(0, state.unreadCount + delta);
          const p = conversation.platform;
          nextUnreadByPlatform[p] = Math.max(0, (nextUnreadByPlatform[p] || 0) + delta);
        }

        return { conversations: sorted, unreadCount: nextUnreadCount, unreadByPlatform: nextUnreadByPlatform };
      });
    },

    removeConversation: (id) => {
      set((state) => {
        const existing = state.conversations.find((c) => c.id === id);
        const nextList = state.conversations.filter((c) => c.id !== id);
        
        let nextUnreadCount = state.unreadCount;
        let nextUnreadByPlatform = { ...state.unreadByPlatform };

        if (existing && existing.unread_count > 0) {
          nextUnreadCount = Math.max(0, state.unreadCount - existing.unread_count);
          const p = existing.platform;
          nextUnreadByPlatform[p] = Math.max(0, (nextUnreadByPlatform[p] || 0) - existing.unread_count);
        }

        return {
          conversations: nextList,
          unreadCount: nextUnreadCount,
          unreadByPlatform: nextUnreadByPlatform,
          selectedConversationId:
            state.selectedConversationId === id
              ? null
              : state.selectedConversationId,
        };
      });
    },

    // ── Message Actions ─────────────────────────────────────────────

    addMessage: (conversationId, message) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] ?? [];
        // Deduplicate by ID and platform_message_id
        if (
          existing.some(
            (m) =>
              m.id === message.id ||
              (m.platform_message_id &&
                message.platform_message_id &&
                m.platform_message_id === message.platform_message_id)
          )
        ) {
          return state;
        }
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [...existing, message],
          },
        };
      });
    },

    updateMessage: (conversationId, message) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] ?? [];
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: existing.map((m) =>
              (m.id === message.id || (m.platform_message_id && m.platform_message_id === message.platform_message_id))
                ? { ...m, ...message }
                : m
            ),
          },
        };
      });
    },

    setMessages: (conversationId, messages) => {
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: messages,
        },
      }));
    },

    // ── Optimistic Operations ───────────────────────────────────────

    markAsRead: (conversationId) => {
      set((state) => {
        const conv = state.conversations.find((c) => c.id === conversationId);
        const deduct = conv?.unread_count || 0;
        
        const nextUnreadByPlatform = { ...state.unreadByPlatform };
        if (conv && deduct > 0) {
          nextUnreadByPlatform[conv.platform] = Math.max(0, (nextUnreadByPlatform[conv.platform] || 0) - deduct);
        }

        return {
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c
          ),
          unreadCount: Math.max(0, state.unreadCount - deduct),
          unreadByPlatform: nextUnreadByPlatform,
        };
      });
    },

    sendMessage: (conversationId, optimisticMessage) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] ?? [];
        const nextMessages = [...existing, optimisticMessage];

        let preview = optimisticMessage.text || "";
        if (!preview && optimisticMessage.attachments) {
          const firstAtt = Array.isArray(optimisticMessage.attachments)
            ? optimisticMessage.attachments[0]
            : null;
          preview = (firstAtt as any)?.isVoiceNote
            ? "🎤 Voice Note"
            : (firstAtt as any)?.type === "image"
            ? "📸 Photo"
            : (firstAtt as any)?.type === "video"
            ? "🎬 Video"
            : "📎 Attachment";
        }
        if (optimisticMessage.is_internal) {
          preview = `[Internal Note] ${preview}`;
        }

        // Instantly reflect the sent message in the conversation row and sort to top
        const updatedConversations = state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message_preview: preview || c.last_message_preview,
                last_message_at: optimisticMessage.created_at,
                unread_count: 0,
              }
            : c
        );

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: nextMessages,
          },
          conversations: sortConversations(updatedConversations),
        };
      });
    },

    confirmMessage: (conversationId, optimisticId, confirmed) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] ?? [];
        const nextMessages = existing.map((m) =>
          m.id === optimisticId ? confirmed : m
        );

        let preview = confirmed.text || "";
        if (!preview && confirmed.attachments) {
          const firstAtt = Array.isArray(confirmed.attachments)
            ? confirmed.attachments[0]
            : null;
          preview = (firstAtt as any)?.isVoiceNote
            ? "🎤 Voice Note"
            : (firstAtt as any)?.type === "image"
            ? "📸 Photo"
            : (firstAtt as any)?.type === "video"
            ? "🎬 Video"
            : "📎 Attachment";
        }
        if (confirmed.is_internal) {
          preview = `[Internal Note] ${preview}`;
        }

        const updatedConversations = state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message_preview: preview || c.last_message_preview,
                last_message_at: confirmed.created_at || c.last_message_at,
                unread_count: 0,
              }
            : c
        );

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: nextMessages,
          },
          conversations: sortConversations(updatedConversations),
        };
      });
    },

    failMessage: (conversationId, optimisticId) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] ?? [];
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: existing.map((m) =>
              m.id === optimisticId
                ? { ...m, status: "failed" as const }
                : m
            ),
          },
        };
      });
    },

    setMessagesLoading: (loading) => {
      set({ messagesLoading: loading });
    },
  }))
);

// ── Selectors ─────────────────────────────────────────────────────────────────
// Fine-grained selectors prevent unnecessary re-renders.

export const selectConversations = (state: InboxState) => state.conversations;
export const selectSelectedId = (state: InboxState) => state.selectedConversationId;
export const selectUnreadCount = (state: InboxState) => state.unreadCount;
export const selectFilters = (state: InboxState) => state.filters;
export const selectMessagesLoading = (state: InboxState) => state.messagesLoading;
export const selectConversationsLoaded = (state: InboxState) => state.conversationsLoaded;

export const selectSelectedConversation = (state: InboxState): Conversation | null => {
  if (!state.selectedConversationId) return null;
  return (
    state.conversations.find((c) => c.id === state.selectedConversationId) ?? null
  );
};

const EMPTY_MESSAGES: Message[] = [];
export const selectCurrentMessages = (state: InboxState): Message[] => {
  if (!state.selectedConversationId) return EMPTY_MESSAGES;
  return state.messagesByConversation[state.selectedConversationId] ?? EMPTY_MESSAGES;
};

// selectFilteredConversations removed to prevent infinite render loops in useSyncExternalStore
// Filter logic moved to the component using useMemo.

export const selectUnreadByPlatform = (state: InboxState) => state.unreadByPlatform;
export const selectUnreadAll = (state: InboxState) => state.unreadCount;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortConversations(conversations: Conversation[]): Conversation[] {
  const seenIds = new Set<string>();
  const seenLateIds = new Set<string>();
  const seenContactIds = new Set<string>();
  const deduplicated: Conversation[] = [];

  for (const c of conversations) {
    if (!c || !c.id || seenIds.has(c.id)) continue;
    seenIds.add(c.id);

    const lateKey = c.late_conversation_id ? `${c.channel_id || "ch"}:${c.late_conversation_id}` : null;
    const contactKey = c.contact_id ? `${c.channel_id || "ch"}:${c.contact_id}` : null;

    if (lateKey && seenLateIds.has(lateKey)) continue;
    if (contactKey && seenContactIds.has(contactKey)) continue;

    if (lateKey) seenLateIds.add(lateKey);
    if (contactKey) seenContactIds.add(contactKey);

    deduplicated.push(c);
  }

  return deduplicated.sort((a, b) => {
    const aTime = new Date(a.last_message_at || a.created_at).getTime();
    const bTime = new Date(b.last_message_at || b.created_at).getTime();
    if (bTime !== aTime) return bTime - aTime;
    return a.id.localeCompare(b.id);
  });
}
