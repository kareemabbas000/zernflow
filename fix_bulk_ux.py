import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Replace executeBulkAction
execute_bulk_old = """  const executeBulkAction = async (action: string) => {
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

execute_bulk_new = """  const executeBulkAction = async (action: string) => {
    try {
      const selected = Array.from(selectedConversations);
      if (selected.length === 0) return;
      
      let payload = {};
      if (action === 'mark_read') payload = { unread_count: 0 };
      if (action === 'close') payload = { status: 'closed' };
      if (action === 'archive') payload = { status: 'archived' };

      // In a real app we would want a bulk API endpoint, 
      // but we can simulate it with Promise.all for now.
      await Promise.all(selected.map(id => 
        fetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      ));
      
      // Since we don't have SWR hooked into this specific component directly for refresh,
      // we just clear selection. A real implementation would queryClient.invalidateQueries()
      clearSelection();
      setIsBulkMode(false);
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };"""

text = text.replace(execute_bulk_old, execute_bulk_new)


# 2. Replace Header Layout
header_old = """        {isBulkMode ? (
          <>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[var(--ink)] tracking-tight">
                Select Chats
              </h2>
              <span className="text-xs font-medium text-[var(--ink-2)]">
                {selectedConversations.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedConversations.size === filtered.length) {
                    clearSelection();
                  } else {
                    const selectAll = useInboxStore.getState().selectAll;
                    selectAll(filtered.map(c => c.id));
                  }
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-2)]"
              >
                Cancel
              </button>
            </div>
          </>
        )"""

header_new = """        {isBulkMode ? (
          <>
            <div className="flex items-center gap-1.5 shrink-0 overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-2)] shrink-0 hidden sm:inline-block">
                Bulk Selection
              </span>
              <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-[10px] font-bold text-primary shrink-0 whitespace-nowrap">
                {selectedConversations.size} selected
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (selectedConversations.size === filtered.length) {
                    clearSelection();
                  } else {
                    const selectAll = useInboxStore.getState().selectAll;
                    selectAll(filtered.map(c => c.id));
                  }
                }}
                className="px-2 py-1 rounded-md text-[10px] font-bold transition-all bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border)] whitespace-nowrap"
              >
                {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="px-2 py-1 rounded-md text-[10px] font-bold transition-all text-white bg-[var(--ink)] hover:bg-[var(--ink-2)]"
              >
                Done
              </button>
            </div>
          </>
        )"""

text = text.replace(header_old, header_new)

# 3. Replace floating toolbar layout
toolbar_old = """            <div className="px-3 py-1 flex items-center justify-center border-r border-white/10">
              <span className="text-xs font-bold">{selectedConversations.size} selected</span>
            </div>"""

toolbar_new = """            <div className="px-3 py-1 flex items-center justify-center border-r border-white/10">
              <span className="text-xs font-bold whitespace-nowrap">{selectedConversations.size} selected</span>
            </div>"""

text = text.replace(toolbar_old, toolbar_new)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

