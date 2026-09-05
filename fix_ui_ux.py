import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Fix the Header correctly
header_block_regex = re.compile(r'\{\/\* Header \*\/\}.*?(?=\{\/\* Platform Tabs \*\/\})', re.DOTALL)

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

text = header_block_regex.sub(new_header, text)

# 2. Fix the Checkbox UI overlapping.
checkbox_block_regex = re.compile(r'\{\/\* Avatar with platform badge \/ Checkbox \*\/\}.*?(?=\{\/\* Content \*\/\})', re.DOTALL)
new_checkbox_block = """{/* Checkbox (Bulk Mode) + Avatar */}
                  <div className="flex items-center gap-2 pr-1">
                    {isBulkMode && (
                      <div className="shrink-0 flex items-center justify-center animate-in slide-in-from-left-4 fade-in duration-200">
                        <Checkbox 
                          checked={selectedConversations.has(conversation.id)}
                          onCheckedChange={() => toggleSelection(conversation.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded-full data-[state=checked]:bg-primary shadow-sm bg-[var(--paper)] border-[var(--border)]"
                        />
                      </div>
                    )}
                    <div className="relative shrink-0 flex items-center justify-center w-10 h-10 transition-all duration-200">
                      <Avatar
                        src={conversation.contacts?.avatar_url}
                        name={contactName}
                        platform={conversation.platform as Platform}
                        size="lg"
                      />
                    </div>
                  </div>

                  """
text = checkbox_block_regex.sub(new_checkbox_block, text)

# 3. Add the Floating Bulk Action Toolbar at the very end of the file, just inside the main wrapper.
# Find the last closing tag.
# We will just inject it before the last `    </div>\n  );\n}`
floating_toolbar = """
      {/* Floating Bulk Action Toolbar */}
      {isBulkMode && selectedConversations.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-1.5 p-1.5 bg-[var(--ink)] text-[var(--paper)] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
            <div className="px-3 py-1 flex items-center justify-center border-r border-white/10">
              <span className="text-xs font-bold">{selectedConversations.size} selected</span>
            </div>
            
            <button
              onClick={async () => {
                await executeBulkAction('mark_read');
              }}
              disabled={messagesLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold"
            >
              <MailOpen className="h-3.5 w-3.5" />
              <span>Read</span>
            </button>
            
            <button
              onClick={async () => {
                await executeBulkAction('close');
              }}
              disabled={messagesLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
            
            <button
              onClick={async () => {
                await executeBulkAction('archive');
              }}
              disabled={messagesLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      )}
"""

text = text.replace("    </div>\n  );\n}", floating_toolbar + "\n    </div>\n  );\n}")

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

