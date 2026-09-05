import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Compress top header space
text = text.replace(
    '      <div className="p-4 shrink-0 border-b border-[var(--border)] relative z-20 bg-[var(--surface-2)]">',
    '      <div className="p-3 shrink-0 border-b border-[var(--border)] relative z-20 bg-[var(--surface-2)]">'
)
text = text.replace(
    '        <div className="flex items-center justify-between mb-3">',
    '        <div className="flex items-center justify-between mb-2">'
)
text = text.replace(
    '      {/* Search & Status Filters */}\n      <div className="flex flex-col gap-2 p-3 shrink-0 relative z-10 border-b border-[var(--border)]/40 bg-[var(--surface-2)]/30">',
    '      {/* Search & Status Filters */}\n      <div className="flex flex-col gap-1.5 px-3 py-2 shrink-0 relative z-10 border-b border-[var(--border)]/40 bg-[var(--surface-2)]/30">'
)

# 2. Change active selection style
text = text.replace(
    '''              className={cn(
                "group relative cursor-pointer p-4 transition-all hover:bg-[var(--surface)]",
                isActive
                  ? "bg-blue-500/10 border-l-4 border-blue-600"
                  : "border-l-4 border-transparent",
              )}''',
    '''              className={cn(
                "group relative cursor-pointer p-4 transition-all hover:bg-[var(--surface-2)]/50",
                isActive
                  ? "bg-[var(--paper)] shadow-sm border-l-4 border-[var(--brand)] z-10"
                  : "bg-transparent border-l-4 border-transparent",
              )}'''
)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
