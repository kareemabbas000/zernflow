import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

definition = """  const clearSelection = useInboxStore((s) => s.clearSelection);

  const executeBulkAction = async (action: string) => {
    try {
      const selected = Array.from(selectedConversations);
      if (selected.length === 0) return;
      
      const response = await fetch('/api/v1/conversations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, conversationIds: selected }),
      });
      
      if (!response.ok) throw new Error('Failed to execute bulk action');
      
      clearSelection();
      setIsBulkMode(false);
      // In a real app we'd mutate SWR or trigger a refresh here
    } catch (err) {
      console.error(err);
    }
  };"""

text = text.replace('  const clearSelection = useInboxStore((s) => s.clearSelection);', definition)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

