with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

old_header = """            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadMoreConversations(true)}"""

new_header = """            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5 mr-1 bg-[var(--surface)] border border-[var(--border)] rounded-md p-0.5">
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
              </div>
              <button
                type="button"
                onClick={() => loadMoreConversations(true)}"""

text = text.replace(old_header, new_header)

# Add Lucide imports if not there
if "Volume2" not in text:
    text = text.replace('import {', 'import { Volume2, VolumeX, Bell, BellOff,', 1)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

