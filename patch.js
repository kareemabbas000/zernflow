const fs = require('fs');
const file = '/Users/KareemAbbas/Downloads/zernflow/lib/stores/inbox-store.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /export const selectFilteredConversations = \(state: InboxState\): Conversation\[\] => {[\s\S]*?};\n/g,
  `export const selectFilteredConversations = (state: InboxState): Conversation[] => {
  const { status, platform, search } = state.filters;
  // Performance optimization: we don't want to return a new array reference every render
  // but Zustand handles this fairly well. 
  return state.conversations.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (platform !== "all" && c.platform !== platform) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = c.contacts?.display_name?.toLowerCase() ?? "";
      const preview = c.last_message_preview?.toLowerCase() ?? "";
      if (!name.includes(q) && !preview.includes(q)) return false;
    }
    return true;
  });
};
`
);

code = code.replace(
  /export const selectUnreadByPlatform = \([\s\S]*?\): Record<string, number> => {\n  return { ...state.unreadByPlatform, all: state.unreadCount };\n};\n/g,
  `export const selectUnreadByPlatform = (state: InboxState) => state.unreadByPlatform;\nexport const selectUnreadAll = (state: InboxState) => state.unreadCount;\n`
);

fs.writeFileSync(file, code);
