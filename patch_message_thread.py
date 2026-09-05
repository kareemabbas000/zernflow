import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Remove useConversationMessages import
text = re.sub(r'import \{ useConversationMessages \} from "@/lib/hooks/use-inbox-queries";\n', '', text)

# Remove the query call and redundant message assignment
text = re.sub(r'  const \{ data: queryMessages \} = useConversationMessages\(\n    conversation\?\.id \?\? null,\n  \);\n\n  // Combine query and store messages for instant reactivity\n  const messages =\n    queryMessages && queryMessages\.length > 0\n      \? queryMessages\n      : storeMessages\.length > 0\n        \? storeMessages\n        : initialMessages;\n', '  const messages = initialMessages;\n', text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)
