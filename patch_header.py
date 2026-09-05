import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Replace the Header container
text = text.replace(
    '      <div className="flex h-13 sm:h-14 items-center justify-between border-b border-[var(--border)] px-3 sm:px-4 bg-[var(--paper)]/90 backdrop-blur-md shrink-0 z-10 gap-2">',
    '      <div className="flex flex-wrap sm:flex-nowrap min-h-14 items-center justify-between border-b border-[var(--border)] px-3 sm:px-4 py-2 sm:py-0 bg-[var(--paper)]/90 backdrop-blur-md shrink-0 z-10 gap-y-2 gap-x-2">'
)
# Modify the Left: Contact Info to stretch if needed
text = text.replace(
    '        <div className="flex items-center gap-2.5 min-w-0 flex-1">',
    '        <div className="flex items-center gap-2.5 min-w-0 flex-1 w-full sm:w-auto">'
)
text = text.replace(
    '              <p className="text-xs sm:text-sm font-bold text-[var(--ink)] truncate max-w-[120px] sm:max-w-[200px] md:max-w-[280px]">',
    '              <p className="text-sm font-bold text-[var(--ink)] truncate max-w-[160px] sm:max-w-[220px] md:max-w-[280px]">'
)
text = text.replace(
    '        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">',
    '        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto overflow-x-auto scrollbar-none justify-between sm:justify-end pb-1 sm:pb-0">'
)
text = text.replace(
    '                <span className="hidden sm:inline font-semibold">Close</span>',
    '                <span className="font-semibold text-xs">Close</span>'
)


with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)
