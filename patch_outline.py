import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Make the selected item look beautifully highlighted with borders on all sides
old_style = 'isSelected\n                      ? "bg-background border-l-4 border-[var(--brand)]"'
new_style = 'isSelected\n                      ? "bg-primary/5 border-y border-l-4 border-r border-[var(--brand)] shadow-md z-10 relative"'

text = text.replace(old_style, new_style)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

