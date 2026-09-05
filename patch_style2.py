import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Replace bg-[var(--surface)] with bg-[var(--paper)] or bg-background
new_style = 'isSelected\n                      ? "bg-background border-l-4 border-[var(--brand)]"'
old_style_2 = 'isSelected\n                      ? "bg-[var(--surface)] border-l-4 border-[var(--brand)]"'

text = text.replace(old_style_2, new_style)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

