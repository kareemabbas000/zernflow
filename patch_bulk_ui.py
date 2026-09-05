import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Add Checkbox import
if "import { Checkbox }" not in text:
    text = text.replace('import { Avatar } from "@/components/ui/avatar";', 'import { Avatar } from "@/components/ui/avatar";\nimport { Checkbox } from "@/components/ui/checkbox";')

# 2. Add bulk icons import
if "Archive," not in text:
    text = text.replace('import { Search, X, Check, Filter } from "lucide-react";', 'import { Search, X, Check, Filter, Archive, Trash2, Mail, MailOpen } from "lucide-react";')
else:
    # try generic replace if it fails
    if "Trash2" not in text:
        text = text.replace('import {', 'import { Archive, Trash2, Mail, MailOpen,', 1)

# 3. Bring in the selection state from inboxStore
store_hooks = """  const setFilters = useInboxStore((s) => s.setFilters);
  const selectedConversations = useInboxStore((s) => s.selectedConversations);
  const toggleSelection = useInboxStore((s) => s.toggleSelection);
  const clearSelection = useInboxStore((s) => s.clearSelection);
  const selectAll = useInboxStore((s) => s.selectAll);
"""
text = text.replace('  const setFilters = useInboxStore((s) => s.setFilters);', store_hooks)

# 4. Handle row click: if selection mode is active, toggle selection instead of opening
row_click_old = 'onClick={() => onSelect(conversation)}'
row_click_new = 'onClick={() => selectedConversations.size > 0 ? toggleSelection(conversation.id) : onSelect(conversation)}'
text = text.replace(row_click_old, row_click_new)

# 5. Add checkbox to the row (visible on hover or when selected)
avatar_section_old = """                  {/* Avatar with platform badge */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={conversation.contacts?.avatar_url}
                      name={contactName}
                      platform={conversation.platform as Platform}
                      size="lg"
                    />
                  </div>"""

avatar_section_new = """                  {/* Avatar with platform badge / Checkbox */}
                  <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-background rounded-full transition-opacity z-20",
                      selectedConversations.has(conversation.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Checkbox 
                        checked={selectedConversations.has(conversation.id)}
                        onCheckedChange={() => toggleSelection(conversation.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded-full data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className={cn(
                      "transition-opacity",
                      selectedConversations.has(conversation.id) ? "opacity-0" : "opacity-100 group-hover:opacity-0"
                    )}>
                      <Avatar
                        src={conversation.contacts?.avatar_url}
                        name={contactName}
                        platform={conversation.platform as Platform}
                        size="lg"
                      />
                    </div>
                  </div>"""
text = text.replace(avatar_section_old, avatar_section_new)

# 6. Add bulk action toolbar at the top (before Search)
search_section_old = """      {/* Search and Filters */}
      <div className="px-3 sm:px-4 py-3 border-b border-[var(--border)] shrink-0 bg-[var(--paper)]">"""

search_section_new = """      {/* Bulk Action Toolbar */}
      {selectedConversations.size > 0 && (
        <div className="px-3 sm:px-4 py-2 border-b border-[var(--border)] shrink-0 bg-primary/5 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <button onClick={clearSelection} className="p-1 rounded-md hover:bg-black/5 text-[var(--ink-2)] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-primary">{selectedConversations.size} selected</span>
          </div>
          <div className="flex items-center gap-1">
            <button title="Mark as Read" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <MailOpen className="w-4 h-4" />
            </button>
            <button title="Mark as Unread" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <Mail className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button title="Archive" className="p-1.5 rounded-md hover:bg-black/5 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
              <Archive className="w-4 h-4" />
            </button>
            <button title="Delete" className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={cn("px-3 sm:px-4 py-3 border-b border-[var(--border)] shrink-0 bg-[var(--paper)] transition-all", selectedConversations.size > 0 ? "hidden" : "block")}>"""

text = text.replace(search_section_old, search_section_new)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

