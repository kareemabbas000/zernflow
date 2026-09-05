import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Make sure we import Select
if "SelectContent" not in text:
    text = re.sub(r'(import .*?;\n)', r'\1import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\n', text, count=1)

# Find the block for "Channels Quick Filters"
# Replace it with a Select component
regex = r'\{\/\* Channels Quick Filters \*\/\}.*?\{\/\* end Channels Quick Filters \*\/\}\n'
replacement = """{/* Channels Quick Filters */}
        {availableChannels.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--ink-2)]">Channels</span>
            <Select
              value={filters.channelId === "all" ? "all" : filters.channelId}
              onValueChange={(val) => setFilters({ channelId: val })}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs bg-[var(--paper)] border-[var(--border)]">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {availableChannels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    <div className="flex items-center gap-2">
                      {ch.picture ? (
                        <img src={ch.picture} alt="" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[var(--surface-2)] border border-[var(--border)]" />
                      )}
                      <span>{ch.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* end Channels Quick Filters */}
"""
if "{/* end Channels Quick Filters */}" not in text:
    # Manual patch for the channel list if the comment isn't there
    # Let's search for "overflow-x-auto" and "no-scrollbar" which wrap the channels
    regex = r'<div className="flex items-center gap-1\.5 px-3 py-1\.5 overflow-x-auto no-scrollbar border-b border-\[var\(--border\)\] shrink-0 bg-\[var\(--surface-2\)\]">.*?</div>'
    text = re.sub(regex, replacement, text, flags=re.DOTALL)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

