import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Replace the overflow-x-auto class
old_toolbar = 'className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto overflow-x-auto scrollbar-none justify-between sm:justify-end pb-1 sm:pb-0"'
new_toolbar = 'className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto flex-wrap justify-between sm:justify-end pb-1 sm:pb-0"'

text = text.replace(old_toolbar, new_toolbar)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

