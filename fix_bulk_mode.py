import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# 1. Add bulk mode state
text = text.replace('  const unreadAll = useInboxStore(selectUnreadAll);\n', '  const unreadAll = useInboxStore(selectUnreadAll);\n  const [isBulkMode, setIsBulkMode] = useState(false);\n')

# 2. Add "Select" button to the header
header_regex = re.compile(r'(<div className="flex items-center justify-between px-3 py-2 border-b border-\[var\(--border\)\] shrink-0 bg-\[var\(--surface-2\)\]">.*?)</div>\s*(?:\{\/\* Filters Tabs)', re.DOTALL)
def add_select_btn(match):
    header = match.group(1)
    new_btn = """
          <button 
            onClick={() => {
              if (isBulkMode) {
                clearSelection();
                setIsBulkMode(false);
              } else {
                setIsBulkMode(true);
              }
            }}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-semibold transition-colors",
              isBulkMode ? "bg-primary text-primary-foreground" : "bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)]"
            )}
          >
            {isBulkMode ? "Cancel" : "Select"}
          </button>
"""
    # Insert before the last closing div of the header
    parts = header.rsplit('</div>', 1)
    return parts[0] + new_btn + '</div>\n</div>\n      {/* Filters Tabs'
    
text = header_regex.sub(add_select_btn, text)

# 3. Modify the Checkbox rendering logic to only show in bulk mode
checkbox_old = """                  <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
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
                      <Avatar"""

checkbox_new = """                  <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
                    {isBulkMode && (
                      <div className="absolute -left-1.5 inset-y-0 flex items-center z-20">
                        <Checkbox 
                          checked={selectedConversations.has(conversation.id)}
                          onCheckedChange={() => toggleSelection(conversation.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded-full data-[state=checked]:bg-primary shadow-sm bg-[var(--paper)] border-[var(--border)]"
                        />
                      </div>
                    )}
                    <div className={cn(
                      "transition-transform",
                      isBulkMode ? "translate-x-4 scale-90" : ""
                    )}>
                      <Avatar"""

text = text.replace(checkbox_old, checkbox_new)

# 4. Modify onClick of the conversation card
click_old = """onClick={() => selectedConversations.size > 0 ? toggleSelection(conversation.id) : onSelect(conversation)}"""
click_new = """onClick={() => isBulkMode ? toggleSelection(conversation.id) : onSelect(conversation)}"""
text = text.replace(click_old, click_new)

# 5. Bulk Toolbar visibility should be tied to isBulkMode
toolbar_old = """{selectedConversations.size > 0 && ("""
toolbar_new = """{isBulkMode && ("""
text = text.replace(toolbar_old, toolbar_new)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

