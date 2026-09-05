import sys

with open('components/inbox/message-thread.tsx', 'r') as f:
    text = f.read()

# 1. Update Props
text = text.replace(
'''export function MessageThread({
  conversation,
  messages: initialMessages,
}: {
  conversation: Conversation | null;
  messages: Message[];
}) {''',
'''export function MessageThread({
  conversation,
  messages: initialMessages,
  isProfileOpen,
  onOpenProfile,
}: {
  conversation: Conversation | null;
  messages: Message[];
  isProfileOpen?: boolean;
  onOpenProfile?: () => void;
}) {'''
)

# 2. Add Contact Info Toggle button before More Actions Dropdown
text = text.replace(
'''          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>''',
'''          {/* Contact Profile Toggle */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isProfileOpen 
                  ? "bg-primary/10 text-primary" 
                  : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)]"
              )}
              title="Contact Profile"
            >
              <Info className="h-4 w-4" />
            </button>
          )}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>'''
)

# 3. Update composer positioning
text = text.replace(
'''      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-[180px] scroll-smooth"
      >''',
'''      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-4 scroll-smooth"
      >'''
)

text = text.replace(
'''      {/* Floating Composer */}
      <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
        {/* Container for composer */}
        <div className="mx-auto max-w-4xl relative pointer-events-auto bg-[var(--surface-2)]/80 backdrop-blur-3xl p-3 md:p-4 rounded-[2.5rem] shadow-2xl border border-[var(--border)] ring-1 ring-black/5">''',
'''      {/* Bottom Composer */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30">
        <div className="mx-auto max-w-4xl p-3 md:p-4">'''
)

with open('components/inbox/message-thread.tsx', 'w') as f:
    f.write(text)
