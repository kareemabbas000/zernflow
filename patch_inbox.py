import re

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "r") as f:
    text = f.read()

# 1. Remove the problematic useEffects
text = re.sub(r'  useEffect\(\(\) => \{\n    if \(selectedId && queryMessages\).*?\}, \[selectedId, queryMessages, setMessages\]\);\n', '', text, flags=re.DOTALL)
text = re.sub(r'  useEffect\(\(\) => \{\n    if \(targetConvId && displayConversations\.length > 0\).*?\}, \[targetConvId, displayConversations, selectedId, handleSelectConversation\]\);\n', '', text, flags=re.DOTALL)

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "w") as f:
    f.write(text)
