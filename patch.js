const fs = require('fs');
const file = '/Users/KareemAbbas/Downloads/zernflow/lib/stores/inbox-store.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /export const selectCurrentMessages = \(state: InboxState\): Message\[\] => {\n  if \(\!state\.selectedConversationId\) return \[\];\n  return state\.messagesByConversation\[state\.selectedConversationId\] \?\? \[\];\n};/g,
  `const EMPTY_MESSAGES: Message[] = [];\nexport const selectCurrentMessages = (state: InboxState): Message[] => {\n  if (!state.selectedConversationId) return EMPTY_MESSAGES;\n  return state.messagesByConversation[state.selectedConversationId] ?? EMPTY_MESSAGES;\n};`
);

code = code.replace(
  /export const selectFilteredConversations = \(state: InboxState\): Conversation\[\] => {[\s\S]*?return true;\n  });\n};/g,
  `// selectFilteredConversations removed to prevent infinite render loops in useSyncExternalStore\n// Filter logic moved to the component using useMemo.`
);

fs.writeFileSync(file, code);
