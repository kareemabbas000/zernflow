import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Add createClient import if needed
if "createClient" not in text:
    text = text.replace('import { useInboxFilters }', 'import { createClient } from "@/utils/supabase/client";\nimport { useInboxFilters }')

# 2. Fix executeBulkAction
old_execute = """  const executeBulkAction = async (action: string) => {
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
      
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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

text = text.replace(old_execute, new_execute)

# 3. Replace the Main Header and Utility Strip with a single dynamic Header
# We'll use regex to replace from {/* Main Header */} down to the end of {/* Utility Strip */}
header_pattern = re.compile(r"\{\/\*\s*Main Header\s*\*\/\}.*?\{\/\*\s*Platform Tabs\s*\*\/\}", re.DOTALL)

unified_header = """{/* Unified Header Row */}
      <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-3 bg-[var(--surface-2)] shrink-0 transition-all duration-200">
        {isBulkMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
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
                className="px-2 py-1 rounded text-[10px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              >
                {selectedConversations.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => executeBulkAction('mark_read')}
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                title="Mark Read"
              >
                <MailOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => executeBulkAction('close')}
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
                title="Close Conversations"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="p-1.5 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors mr-2"
                title="Archive Conversations"
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSelection();
                  setIsBulkMode(false);
                }}
                className="px-3 py-1 rounded-md bg-[var(--ink)] hover:bg-[var(--ink-2)] text-white text-[11px] font-bold transition-colors"
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
                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  {unreadAll} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[10px] font-bold text-[var(--ink-2)] transition-colors border border-[var(--border)]"
              >
                <CheckSquare className="h-3 w-3" />
                Select
              </button>
              <div className="h-4 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleSoundMute()}
                className="p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] focus:outline-none"
                title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isSoundMuted ? <VolumeX className="h-4 w-4 text-amber-500" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleToastsMute()}
                className="p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] focus:outline-none"
                title={isToastsMuted ? "Unmute Popups" : "Mute Popups"}
              >
                {isToastsMuted ? <BellOff className="h-4 w-4 text-amber-500" /> : <Bell className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => loadMoreConversations(true)}
                disabled={syncingPlatform}
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50 focus:outline-none ml-1"
                title="Sync latest chats"
              >
                <RefreshCw className={cn("h-4 w-4", syncingPlatform && "animate-spin text-[var(--brand)]")} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Platform Tabs */}"""

text = header_pattern.sub(unified_header, text)

# 4. Remove the floating bulk action toolbar at the bottom completely
floating_pattern = re.compile(r"\{\/\*\s*Floating Bulk Action Toolbar\s*\*\/\}.*?<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}", re.DOTALL)

# We must keep the closing `</div>\n  );\n}` from the component!
text = floating_pattern.sub("    </div>\n  );\n}", text)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
print("Success")
