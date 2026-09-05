with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Replace the bulk row to be hyper-compact and properly aligned
old_bulk = """      <div className="flex min-h-[40px] items-center justify-between border-b border-[var(--border)]/50 px-2 sm:px-3 bg-[var(--paper)] shrink-0 transition-all duration-200 overflow-x-auto scrollbar-none">
        {isBulkMode ? (
          <>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                {selectedConversations.size} <span className="hidden sm:inline">selected</span>
              </span>
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
                className="px-1.5 sm:px-2 py-1 rounded text-[10px] font-bold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors whitespace-nowrap shrink-0"
              >
                {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto pl-2">
              <button
                onClick={() => executeBulkAction('mark_read')}
                className="flex items-center justify-center p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Mark Selected as Read"
              >
                <MailOpen className="h-4 w-4 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => executeBulkAction('mark_unread')}
                className="flex items-center justify-center p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Mark Selected as Unread"
              >
                <Mail className="h-4 w-4 sm:h-4 sm:w-4" />
              </button>
              <div className="h-4 w-[1px] bg-[var(--border)] mx-0.5 shrink-0" />
              <button
                onClick={() => executeBulkAction('close')}
                className="flex items-center justify-center p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Close Selected Conversations"
              >
                <CheckCircle className="h-4 w-4 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="flex items-center justify-center p-1.5 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Archive Selected Conversations"
              >
                <Archive className="h-4 w-4 sm:h-4 sm:w-4" />
              </button>
              <div className="h-4 w-[1px] bg-[var(--border)] mx-0.5 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="flex items-center justify-center p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0 ml-0.5"
                title="Exit Bulk Mode"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : ("""

new_bulk = """      <div className="flex h-10 items-center justify-between border-b border-[var(--border)]/50 px-2 sm:px-3 bg-[var(--paper)] shrink-0 transition-all duration-200">
        {isBulkMode ? (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                {selectedConversations.size}
              </span>
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
                className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors whitespace-nowrap shrink-0"
              >
                {selectedConversations.size === filtered.length ? "Deselect" : "Select All"}
              </button>
            </div>
            
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => executeBulkAction('mark_read')}
                className="flex items-center justify-center p-1 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Mark Selected as Read"
              >
                <MailOpen className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => executeBulkAction('mark_unread')}
                className="flex items-center justify-center p-1 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Mark Selected as Unread"
              >
                <Mail className="h-3.5 w-3.5" />
              </button>
              <div className="h-3 w-[1px] bg-[var(--border)] mx-0.5 shrink-0" />
              <button
                onClick={() => executeBulkAction('close')}
                className="flex items-center justify-center p-1 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Close Selected Conversations"
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="flex items-center justify-center p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Archive Selected Conversations"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
              <div className="h-3 w-[1px] bg-[var(--border)] mx-0.5 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="flex items-center justify-center p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                title="Exit Bulk Mode"
              >
                <X className="h-4 w-4 text-[var(--danger)]" />
              </button>
            </div>
          </>
        ) : ("""

text = text.replace(old_bulk, new_bulk)
with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
print("Success")
