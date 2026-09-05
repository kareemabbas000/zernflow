import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Fix 1: Remove pb-[72px]
text = text.replace('className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/30 flex flex-col pb-[72px] md:pb-0"',
                    'className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/30 flex flex-col"')

# Fix 2: Remove shadow from isSelected
old_style = 'isSelected\n                      ? "bg-[var(--surface)] shadow-xl shadow-[var(--brand)]/5 border-l-4 border-[var(--brand)] z-10"'
new_style = 'isSelected\n                      ? "bg-background border-l-4 border-[var(--brand)]"'

text = text.replace(old_style, new_style)

# Wait, the user said "bg-[var(--surface)]" is probably fine, let's keep bg-[var(--surface)] but no shadow.
new_style_2 = 'isSelected\n                      ? "bg-[var(--surface)] border-l-4 border-[var(--brand)]"'
text = text.replace(old_style, new_style_2)


with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

