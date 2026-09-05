import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Make sure X is imported from lucide-react if not already
if " X " not in text and "X," not in text and "{ X }" not in text:
    text = text.replace('import {', 'import { X,', 1)

# Fix the Utility Strip Header (Row 2)
# Find the bulk mode part
bulk_pattern = re.compile(r"\{\/\*\s*Header Row 2:\s*Utility Strip.*?\{\/\*\s*Platform Tabs\s*\*\/\}", re.DOTALL)

better_bulk_ui = """{/* Header Row 2: Utility Strip (Selection & Toggles) */}
      <div className="flex min-h-[40px] items-center justify-between border-b border-[var(--border)]/50 px-2 sm:px-3 bg-[var(--paper)] shrink-0 transition-all duration-200 overflow-x-auto scrollbar-none">
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
        ) : (
          <>
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[10px] font-bold text-[var(--ink-2)] transition-colors shrink-0"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Select
              </button>
            </div>
            
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleSoundMute()}
                className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none shrink-0"
                title={isSoundMuted ? "Unmute Sound Notifications" : "Mute Sound Notifications"}
              >
                {isSoundMuted ? <VolumeX className="h-4 w-4 text-amber-500" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => useInboxStore.getState().toggleToastsMute()}
                className="flex items-center justify-center p-1.5 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] focus:outline-none shrink-0"
                title={isToastsMuted ? "Unmute Popup Notifications" : "Mute Popup Notifications"}
              >
                {isToastsMuted ? <BellOff className="h-4 w-4 text-amber-500" /> : <Bell className="h-4 w-4" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Platform Tabs */}"""

text = bulk_pattern.sub(better_bulk_ui, text)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
print("Success")
