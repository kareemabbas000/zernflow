import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

if "import { DropdownMenu" not in text:
    # Just prepend it after the first import
    text = re.sub(r'(import .*?;)', r'\1\nimport { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";', text, count=1)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

