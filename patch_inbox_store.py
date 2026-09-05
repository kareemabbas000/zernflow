import re

with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

# Add selection state to interface
interface_patch = """  selectedConversationId: string | null;
  selectedConversations: Set<string>;
  unreadCount: number;"""
text = text.replace("  selectedConversationId: string | null;\n  unreadCount: number;", interface_patch)

# Add selection actions to interface
actions_patch = """  setFilters: (filters: Partial<InboxFilters>) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Realtime handlers"""
text = text.replace("  setFilters: (filters: Partial<InboxFilters>) => void;\n\n  // Realtime handlers", actions_patch)

# Add initial state
initial_state_patch = """  selectedConversationId: null,
  selectedConversations: new Set(),
  unreadCount: 0,"""
text = text.replace("  selectedConversationId: null,\n  unreadCount: 0,", initial_state_patch)

# Add actions implementation
actions_impl_patch = """    setFilters: (partial) => {
      set((state) => ({
        filters: { ...state.filters, ...partial },
      }));
    },

    toggleSelection: (id) => {
      set((state) => {
        const next = new Set(state.selectedConversations);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedConversations: next };
      });
    },

    selectAll: (ids) => {
      set({ selectedConversations: new Set(ids) });
    },

    clearSelection: () => {
      set({ selectedConversations: new Set() });
    },"""

text = text.replace("""    setFilters: (partial) => {
      set((state) => ({
        filters: { ...state.filters, ...partial },
      }));
    },""", actions_impl_patch)

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)

