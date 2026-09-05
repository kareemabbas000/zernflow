with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

old_state = """    // ── Initial State ─────────────────────────────────────────────
    conversations: [],
    selectedConversationId: null,
    selectedConversations: new Set(),
    unreadCount: 0,
    unreadByPlatform: {},
    filters: { status: "open", platform: "all", channelId: "all", search: "" },
    conversationsLoaded: false,"""

new_state = """    // ── Initial State ─────────────────────────────────────────────
    isSoundMuted: false,
    isToastsMuted: false,

    conversations: [],
    selectedConversationId: null,
    selectedConversations: new Set(),
    unreadCount: 0,
    unreadByPlatform: {},
    filters: { status: "open", platform: "all", channelId: "all", search: "" },
    conversationsLoaded: false,"""

text = text.replace(old_state, new_state)

old_actions = """    // ── Conversation Actions ────────────────────────────────────────"""

new_actions = """    // ── Global Mute Toggles ───────────────────────────────────────
    toggleSoundMute: () => set((state) => {
      const next = !state.isSoundMuted;
      localStorage.setItem("zernflow_sound_muted", String(next));
      return { isSoundMuted: next };
    }),
    toggleToastsMute: () => set((state) => {
      const next = !state.isToastsMuted;
      localStorage.setItem("zernflow_toasts_muted", String(next));
      return { isToastsMuted: next };
    }),

    // ── Conversation Actions ────────────────────────────────────────"""

text = text.replace(old_actions, new_actions)

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)
