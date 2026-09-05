with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

old_upsert = """    upsertConversation: (conversation) => {
      set((state) => {
        const existing = state.conversations.find((c) => c.id === conversation.id);
        const nextList = existing
          ? state.conversations.map((c) =>
              c.id === conversation.id ? conversation : c
            )
          : [conversation, ...state.conversations];"""

new_upsert = """    upsertConversation: (conversation) => {
      set((state) => {
        const existing = state.conversations.find((c) => c.id === conversation.id);
        
        // Ensure we don't lose joined data (contacts, channels) when receiving raw realtime updates
        const mergedConversation = existing 
          ? { 
              ...existing, 
              ...conversation, 
              contacts: conversation.contacts ?? existing.contacts,
              channels: conversation.channels ?? existing.channels 
            } 
          : conversation;

        const nextList = existing
          ? state.conversations.map((c) =>
              c.id === conversation.id ? mergedConversation : c
            )
          : [mergedConversation, ...state.conversations];"""

text = text.replace(old_upsert, new_upsert)

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)
