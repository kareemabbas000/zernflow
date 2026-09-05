import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# 1. Add background color to all DropdownMenuContent
text = text.replace('DropdownMenuContent align="end" className="w-44 p-1.5"', 'DropdownMenuContent align="end" className="w-44 p-1.5 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50"')
text = text.replace('DropdownMenuContent align="end" className="w-52 p-1.5"', 'DropdownMenuContent align="end" className="w-52 p-1.5 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50"')
text = text.replace('DropdownMenuContent align="end" className="w-44 p-1"', 'DropdownMenuContent align="end" className="w-44 p-1 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50"')

# 2. Remove the channel tag from the header
channel_tag_regex = re.compile(r'\{conversation\.channels\?\.display_name && \(\s*<div className="flex items-center gap-1 mt-0\.5">.*?</div>\s*\)\}', re.DOTALL)
text = channel_tag_regex.sub('', text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

