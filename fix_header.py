import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# I will replace the entire header block from {/* Header */} to the start of {/* Filters Tabs */}
header_regex = re.compile(r'\{\/\* Header \*\/\}.*?(?=\{\/\* Filters Tabs)', re.DOTALL)

new_header = """{/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)] shrink-0">
        {isBulkMode ? (
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
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[var(--ink)] tracking-tight">
                Live Inbox
              </h2>
              {unreadAll > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white shadow-none">
                  {unreadAll} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadMoreConversations(true)}
                disabled={syncingPlatform}
                className="p-1 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/80 transition-colors disabled:opacity-50"
                title="Sync latest chats from Instagram/Facebook"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5",
                    syncingPlatform && "animate-spin text-primary",
                  )}
                />
              </button>
              
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--border)]"
              >
                Select
              </button>
            </div>
          </>
        )}
      </div>

      """

text = header_regex.sub(new_header, text)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

