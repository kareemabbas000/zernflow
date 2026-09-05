import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# I need to find the `</DropdownMenu>` that corresponds to the Options menu.
# It is followed by `      {/* Messages Scroll Area */}`.
regex = re.compile(r'(</DropdownMenu>)\s*(\{\/\* Messages Scroll Area \*\/\})', re.DOTALL)
text = regex.sub(r'\1\n        </div>\n      \2', text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

