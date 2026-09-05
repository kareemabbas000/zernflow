import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

header_old = """          <span className="text-xs font-semibold text-[var(--ink-2)]">
            {unreadAll > 0 ? (
              <span className="text-[var(--danger)] font-bold">
                {unreadAll} unread
              </span>
            ) : (
              `${filtered.length} chat${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>
        </div>"""

header_new = """          <span className="text-xs font-semibold text-[var(--ink-2)]">
            {unreadAll > 0 ? (
              <span className="text-[var(--danger)] font-bold">
                {unreadAll} unread
              </span>
            ) : (
              `${filtered.length} chat${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>

          <button
            type="button"
            onClick={() => {
              if (isBulkMode) {
                clearSelection();
                setIsBulkMode(false);
              } else {
                setIsBulkMode(true);
              }
            }}
            className={cn(
              "ml-2 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer",
              isBulkMode 
                ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-2)]" 
                : "bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] border border-[var(--border)]"
            )}
          >
            {isBulkMode ? "Cancel" : "Select"}
          </button>
          
          {isBulkMode && (
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
              className="ml-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>"""

text = text.replace(header_old, header_new)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

