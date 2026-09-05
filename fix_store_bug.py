import re

with open("lib/stores/inbox-store.ts", "r") as f:
    text = f.read()

# Add selectedConversations: new Set(), to Initial State
text = text.replace('    selectedConversationId: null,\n', '    selectedConversationId: null,\n    selectedConversations: new Set(),\n')

with open("lib/stores/inbox-store.ts", "w") as f:
    f.write(text)

