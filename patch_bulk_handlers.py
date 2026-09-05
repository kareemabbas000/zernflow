import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Add state and handler inside the component
handler_code = """  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedConversations.size === 0 || isBulkUpdating) return;
    
    // Optistic UI: We could manually update the store, but for bulk it's safer to just let the realtime channel do its job, or we can quickly re-fetch.
    // For now, let's just show loading state.
    setIsBulkUpdating(true);
    try {
      const res = await fetch("/api/v1/conversations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          conversationIds: Array.from(selectedConversations),
          workspaceId
        })
      });
      if (res.ok) {
        clearSelection();
      }
    } catch (e) {
      console.error("Bulk action failed", e);
    } finally {
      setIsBulkUpdating(false);
    }
  };
"""

text = text.replace('  const [searchQuery, setSearchQuery] = useState("");', handler_code + '\n  const [searchQuery, setSearchQuery] = useState("");')
if "useState(false);" not in text and "setIsBulkUpdating" not in text:
    print("Failed to find searchQuery")

# 2. Wire up the buttons
old_buttons = """          <div className="flex items-center gap-1">
            <button title="Mark as Read" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <MailOpen className="w-4 h-4" />
            </button>
            <button title="Mark as Unread" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <Mail className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button title="Archive" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button title="Delete" className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>"""

new_buttons = """          <div className="flex items-center gap-1">
            <button disabled={isBulkUpdating} onClick={() => handleBulkAction("mark_read")} title="Mark as Read" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors disabled:opacity-50">
              <MailOpen className="w-4 h-4" />
            </button>
            <button disabled={isBulkUpdating} onClick={() => handleBulkAction("mark_unread")} title="Mark as Unread" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors disabled:opacity-50">
              <Mail className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button disabled={isBulkUpdating} onClick={() => handleBulkAction("archive")} title="Archive" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors disabled:opacity-50">
              <Archive className="w-4 h-4" />
            </button>
            <button disabled={isBulkUpdating} onClick={() => {
              if(confirm("Are you sure you want to delete these conversations?")) handleBulkAction("delete");
            }} title="Delete" className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>"""

text = text.replace(old_buttons, new_buttons)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

