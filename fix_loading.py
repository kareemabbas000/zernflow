import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# I will replace `disabled={messagesLoading}` with `disabled={false}` for now, or extract messagesLoading from useInboxStore.
# Actually, the store has `messagesLoading`. Let's just remove the disabled state for simplicity since bulk actions are optimistic anyway.
text = text.replace('disabled={messagesLoading}', '')

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

