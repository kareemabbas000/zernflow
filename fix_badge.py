import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# We need to conditionally render the conversation.channels?.display_name badge
old_badge_condition = "{conversation.channels?.display_name && ("
new_badge_condition = "{conversation.channels?.display_name && filters.platform !== \"all\" && filters.channelId === \"all\" && ("

text = text.replace(old_badge_condition, new_badge_condition)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
print("Success")
