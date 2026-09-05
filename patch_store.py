import re

with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

# Add to InboxState
old_interface = """interface InboxState {
  // ── Conversations ─────────────────────────────────────────────
  conversations: Conversation[];"""

new_interface = """interface InboxState {
  // ── Preferences ─────────────────────────────────────────────
  isSoundMuted: boolean;
  isToastsMuted: boolean;
  toggleSoundMute: () => void;
  toggleToastsMute: () => void;

  // ── Conversations ─────────────────────────────────────────────
  conversations: Conversation[];"""
text = text.replace(old_interface, new_interface)

# Add to createInboxStore
old_store = """export const useInboxStore = create<InboxState>()(
  subscribeWithSelector((set, get) => ({
    // ── Conversations ─────────────────────────────────────────────
    conversations: [],"""

new_store = """export const useInboxStore = create<InboxState>()(
  subscribeWithSelector((set, get) => ({
    // ── Preferences ─────────────────────────────────────────────
    isSoundMuted: typeof window !== 'undefined' ? localStorage.getItem('zernflow-sound-muted') === 'true' : false,
    isToastsMuted: typeof window !== 'undefined' ? localStorage.getItem('zernflow-toasts-muted') === 'true' : false,
    
    toggleSoundMute: () => set((state) => {
      const newVal = !state.isSoundMuted;
      if (typeof window !== 'undefined') localStorage.setItem('zernflow-sound-muted', String(newVal));
      return { isSoundMuted: newVal };
    }),
    
    toggleToastsMute: () => set((state) => {
      const newVal = !state.isToastsMuted;
      if (typeof window !== 'undefined') localStorage.setItem('zernflow-toasts-muted', String(newVal));
      return { isToastsMuted: newVal };
    }),

    // ── Conversations ─────────────────────────────────────────────
    conversations: [],"""
text = text.replace(old_store, new_store)

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)
