with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Make sure DropdownMenu and CheckSquare are imported
if "DropdownMenu" not in text:
    text = text.replace('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";', 'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\nimport { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";')

if "CheckSquare" not in text:
    text = text.replace('import { Search, MessageSquare', 'import { Search, MessageSquare, CheckSquare')

old_header = """      {/* Top Header */}
      <div className="flex h-14 items-center justify-between px-3 py-2 bg-[var(--surface-2)]/30 backdrop-blur-md relative z-20 shrink-0">
        {!isBulkMode && (
          <>
            <div className="flex flex-col">
              <h2 className="text-[17px] font-extrabold tracking-tight text-[var(--ink)] leading-none w-[70px]">
                Live Inbox
              </h2>
              {unreadAll > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white shadow-none">
                  {unreadAll} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5 mr-1 bg-[var(--surface)] border border-[var(--border)] rounded-md p-0.5">
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
              </div>
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
        )}"""

new_header = """      {/* Top Header */}
      <div className="flex h-14 items-center justify-between px-3 py-2 bg-[var(--surface-2)]/30 backdrop-blur-md relative z-20 shrink-0">
        {!isBulkMode && (
          <>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-extrabold tracking-tight text-[var(--ink)] leading-none">
                Live Inbox
              </h2>
              {unreadAll > 0 && (
                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  {unreadAll}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                title="Select Multiple"
              >
                <CheckSquare className="h-4 w-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[var(--surface)] border-[var(--border)] rounded-xl shadow-lg p-1">
                  <DropdownMenuItem 
                    onClick={() => useInboxStore.getState().toggleSoundMute()}
                    className="flex items-center text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer focus:bg-[var(--surface-2)]"
                  >
                    {isSoundMuted ? <VolumeX className="mr-2 h-3.5 w-3.5 text-amber-500" /> : <Volume2 className="mr-2 h-3.5 w-3.5" />}
                    {isSoundMuted ? "Unmute Sound" : "Mute Sound"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => useInboxStore.getState().toggleToastsMute()}
                    className="flex items-center text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer focus:bg-[var(--surface-2)]"
                  >
                    {isToastsMuted ? <BellOff className="mr-2 h-3.5 w-3.5 text-amber-500" /> : <Bell className="mr-2 h-3.5 w-3.5" />}
                    {isToastsMuted ? "Unmute Popups" : "Mute Popups"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[var(--border)] my-1" />
                  <DropdownMenuItem 
                    onClick={() => loadMoreConversations(true)} 
                    disabled={syncingPlatform}
                    className="flex items-center text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer focus:bg-[var(--surface-2)]"
                  >
                    <RefreshCw className={cn("mr-2 h-3.5 w-3.5", syncingPlatform && "animate-spin text-[var(--brand)]")} />
                    Manual Sync
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}"""

text = text.replace(old_header, new_header)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
