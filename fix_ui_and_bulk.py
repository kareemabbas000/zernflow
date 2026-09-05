import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Fix `executeBulkAction` to use the `/api/v1/conversations/bulk` endpoint
old_execute = """  const executeBulkAction = async (action: string) => {
    try {
      const selected = Array.from(selectedConversations);
      if (selected.length === 0) return;
      
      let payload: any = {};
      if (action === 'mark_read') payload = { unread_count: 0 };
      if (action === 'close') payload = { status: 'closed' };
      if (action === 'archive') payload = { status: 'archived' };

      const supabase = createClient();
      await Promise.all(
        selected.map(id => supabase.from("conversations").update(payload).eq("id", id))
      );
      
      // Update local store immediately for optimistic UI
      const store = useInboxStore.getState();
      const currentConvos = store.conversations;
      const updatedConvos = currentConvos.map(c => {
        if (selectedConversations.has(c.id)) {
          return { ...c, ...payload };
        }
        return c;
      });
      store.setConversations(updatedConvos);
      
      clearSelection();
      setIsBulkMode(false);
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };"""

new_execute = """  const executeBulkAction = async (action: string) => {
    try {
      const selected = Array.from(selectedConversations);
      if (selected.length === 0) return;
      
      const res = await fetch('/api/v1/conversations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, conversationIds: selected, workspaceId })
      });
      
      if (!res.ok) throw new Error('Bulk action failed');
      
      // Optimistic UI updates
      let payload: any = {};
      if (action === 'mark_read') payload = { unread_count: 0 };
      if (action === 'mark_unread') payload = { unread_count: 1 };
      if (action === 'close') payload = { status: 'closed' };
      if (action === 'archive') payload = { status: 'archived' };

      const store = useInboxStore.getState();
      const currentConvos = store.conversations;
      const updatedConvos = currentConvos.map(c => {
        if (selectedConversations.has(c.id)) {
          return { ...c, ...payload };
        }
        return c;
      });
      store.setConversations(updatedConvos);
      
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      clearSelection();
      setIsBulkMode(false);
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  };"""

text = text.replace(old_execute, new_execute)

# 2. Fix the header layout to use 2 rows with lower height!
header_pattern = re.compile(r"\{\/\*\s*Unified Header Row\s*\*\/\}.*?\{\/\*\s*Platform Tabs\s*\*\/\}", re.DOTALL)

two_row_header = """{/* Header Row 1: Title and Sync */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)] px-4 bg-[var(--surface-2)] shrink-0">
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
        <button
          type="button"
          onClick={() => loadMoreConversations(true)}
          disabled={syncingPlatform}
          className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50 focus:outline-none"
          title="Sync latest chats"
        >
          <RefreshCw className={cn("h-4 w-4", syncingPlatform && "animate-spin text-[var(--brand)]")} />
        </button>
      </div>

      {/* Header Row 2: Utility Strip (Selection & Toggles) */}
      <div className="flex h-10 items-center justify-between border-b border-[var(--border)]/50 px-3 bg-[var(--paper)] shrink-0 transition-all duration-200">
        {isBulkMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-block">
                {selectedConversations.size} selected
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
                className="px-2 py-1 rounded text-[10px] font-bold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors whitespace-nowrap"
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
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => executeBulkAction('mark_read')}
                className="flex items-center gap-1 p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                title="Mark Selected as Read"
              >
                <MailOpen className="h-4 w-4" />
                <span className="text-[10px] font-bold hidden xl:inline-block">Read</span>
              </button>
              <button
                onClick={() => executeBulkAction('mark_unread')}
                className="flex items-center gap-1 p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                title="Mark Selected as Unread"
              >
                <Mail className="h-4 w-4" />
                <span className="text-[10px] font-bold hidden xl:inline-block">Unread</span>
              </button>
              <div className="h-4 w-[1px] bg-[var(--border)] mx-0.5 hidden sm:block" />
              <button
                onClick={() => executeBulkAction('close')}
                className="flex items-center gap-1 p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                title="Close Selected Conversations"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="text-[10px] font-bold hidden xl:inline-block">Close</span>
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="flex items-center gap-1 p-1.5 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                title="Archive Selected Conversations"
              >
                <Archive className="h-4 w-4" />
                <span className="text-[10px] font-bold hidden xl:inline-block">Archive</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[10px] font-bold text-[var(--ink-2)] transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Select
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleSoundMute()}
                className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none"
                title={isSoundMuted ? "Unmute Sound Notifications" : "Mute Sound Notifications"}
              >
                {isSoundMuted ? <VolumeX className="h-4 w-4 text-amber-500" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleToastsMute()}
                className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none"
                title={isToastsMuted ? "Unmute Popup Notifications" : "Mute Popup Notifications"}
              >
                {isToastsMuted ? <BellOff className="h-4 w-4 text-amber-500" /> : <Bell className="h-4 w-4" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Platform Tabs */}"""

text = header_pattern.sub(two_row_header, text)

# I also need to make sure Mail is imported if they want an unread action
if "MailOpen" in text and "Mail," not in text and " Mail " not in text:
    text = text.replace("MailOpen,", "MailOpen, Mail,")

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
print("Success")
