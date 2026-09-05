import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Replace the Zustand selector that creates a new array
old_selector = """  const storeMessages = useInboxStore((s) =>
    conversation?.id ? (s.messagesByConversation[conversation.id] ?? []) : [],
  );"""

new_selector = """  const storeMessages = useInboxStore((s) =>
    conversation?.id ? s.messagesByConversation[conversation.id] : undefined
  ) || [];"""

if old_selector in text:
    text = text.replace(old_selector, new_selector)
else:
    print("Could not find the exact old selector string.")
    # Let's try regex
    regex = r"  const storeMessages = useInboxStore\(\(s\) =>\n    conversation\?\.id \? \(s\.messagesByConversation\[conversation\.id\] \?\? \[\]\) : \[\]\,\n  \);"
    text = re.sub(regex, new_selector, text, flags=re.DOTALL)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

