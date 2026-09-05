with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Add hook calls to the top of ConversationList
old_top = """  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);"""

new_top = """  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const isSoundMuted = useInboxStore((s) => s.isSoundMuted);
  const isToastsMuted = useInboxStore((s) => s.isToastsMuted);"""

text = text.replace(old_top, new_top)

# 2. Replace the inline hook calls in JSX
old_jsx = """              <div className="flex items-center gap-0.5 mr-1 bg-[var(--surface)] border border-[var(--border)] rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => useInboxStore.getState().toggleSoundMute()}
                  className="p-1 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  title={useInboxStore((s) => s.isSoundMuted) ? "Unmute Sound" : "Mute Sound"}
                >
                  {useInboxStore((s) => s.isSoundMuted) ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => useInboxStore.getState().toggleToastsMute()}
                  className="p-1 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  title={useInboxStore((s) => s.isToastsMuted) ? "Unmute Popups" : "Mute Popups"}
                >
                  {useInboxStore((s) => s.isToastsMuted) ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                </button>
              </div>"""

new_jsx = """              <div className="flex items-center gap-0.5 mr-1 bg-[var(--surface)] border border-[var(--border)] rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => useInboxStore.getState().toggleSoundMute()}
                  className="p-1 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isSoundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => useInboxStore.getState().toggleToastsMute()}
                  className="p-1 rounded-md transition-colors text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  title={isToastsMuted ? "Unmute Popups" : "Mute Popups"}
                >
                  {isToastsMuted ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                </button>
              </div>"""

text = text.replace(old_jsx, new_jsx)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
