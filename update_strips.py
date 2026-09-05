with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# We need to replace the entire Header block from <div className="flex h-14..." up to the platform tabs.
old_header_start = """      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)] shrink-0">
        {isBulkMode ? ("""

old_header_end = """          </>
        )}
      </div>

      {/* Platform Tabs */}"""

# Let's extract exactly the old header string by finding the start and end indices.
start_idx = text.find(old_header_start)
end_idx = text.find(old_header_end) + len(old_header_end)

if start_idx != -1 and end_idx != -1:
    old_header_full = text[start_idx:end_idx - len("      {/* Platform Tabs */}")]

    new_header_full = """      {/* Main Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)] shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-[var(--ink)] tracking-tight">
            Live Inbox
          </h2>
          {unreadAll > 0 && (
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full shrink-0">
              {unreadAll} unread
            </span>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => loadMoreConversations(true)}
            disabled={syncingPlatform}
            className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/80 transition-colors disabled:opacity-50 focus:outline-none"
            title="Sync latest chats from Instagram/Facebook"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                syncingPlatform && "animate-spin text-[var(--brand)]",
              )}
            />
          </button>
        </div>
      </div>

      {/* Utility Strip */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)]/50 px-3 bg-[var(--paper)] shrink-0">
        <div className="flex items-center gap-2">
          {isBulkMode ? (
            <>
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
                className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[10px] font-bold text-[var(--ink)] transition-colors whitespace-nowrap"
              >
                {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="px-2 py-1 rounded bg-[var(--ink-2)] hover:bg-[var(--ink)] text-white text-[10px] font-bold transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <span className="text-[10px] font-medium text-[var(--ink-2)] ml-1 hidden sm:inline-block">
                {selectedConversations.size} selected
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsBulkMode(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[10px] font-bold text-[var(--ink-2)] transition-colors"
            >
              <CheckSquare className="h-3 w-3" />
              Select
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => useInboxStore.getState().toggleSoundMute()}
            className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none"
            title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isSoundMuted ? <VolumeX className="h-3.5 w-3.5 text-amber-500" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => useInboxStore.getState().toggleToastsMute()}
            className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none"
            title={isToastsMuted ? "Unmute Popups" : "Mute Popups"}
          >
            {isToastsMuted ? <BellOff className="h-3.5 w-3.5 text-amber-500" /> : <Bell className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

"""
    text = text.replace(old_header_full, new_header_full)

    with open("components/inbox/conversation-list.tsx", "w") as f:
        f.write(text)
    print("Success")
else:
    print("Could not find old header bounds.")
