with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

old_add = """    addMessage: (conversationId, message) => {
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
    },"""

new_add = """    addMessage: (conversationId, message) => {
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

        // Also update the parent conversation's preview and timestamp instantly!
        let updatedConversations = state.conversations;
        const convIndex = state.conversations.findIndex((c) => c.id === conversationId);
        
        if (convIndex !== -1) {
          const conv = state.conversations[convIndex];
          const newPreview = message.content?.text || (message.content?.attachments ? "Attachment" : "New message");
          const newTime = message.created_at;
          
          // Only update if the new message is actually newer than what we have
          if (!conv.last_message_at || new Date(newTime).getTime() >= new Date(conv.last_message_at).getTime()) {
            const updatedConv = {
              ...conv,
              last_message_preview: newPreview,
              last_message_at: newTime,
            };
            
            // Re-sort the conversations array so the updated one jumps to the top
            const nextList = [...state.conversations];
            nextList[convIndex] = updatedConv;
            
            updatedConversations = [...nextList].sort((a, b) => {
              const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return dateB - dateA;
            });
          }
        }

        return {
          conversations: updatedConversations,
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [...existing, message],
          },
        };
      });
    },"""

text = text.replace(old_add, new_add)

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)
print("Success")
