with open("components/providers/global-live-sync-provider.tsx", "r") as f:
    text = f.read()

# Add an UPDATE listener for messages
if 'event: "UPDATE",' not in text and 'updateMessage' in text:
    old_listener = """      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const message =
            payload.new as Database["public"]["Tables"]["messages"]["Row"];
          if (message.conversation_id) {
            addMessage(message.conversation_id, message);
          }
        }
      )"""

    new_listener = """      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const message =
            payload.new as Database["public"]["Tables"]["messages"]["Row"];
          if (message.conversation_id) {
            addMessage(message.conversation_id, message);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const message =
            payload.new as Database["public"]["Tables"]["messages"]["Row"];
          if (message.conversation_id) {
            // Import/use updateMessage from the store!
            useInboxStore.getState().updateMessage(message.conversation_id, message);
          }
        }
      )"""

    text = text.replace(old_listener, new_listener)

with open("components/providers/global-live-sync-provider.tsx", "w") as f:
    f.write(text)
print("Success")
