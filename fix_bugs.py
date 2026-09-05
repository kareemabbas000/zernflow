import re

with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

# Fix the React import
text = text.replace('import { Archive, Trash2, Mail, MailOpen, useState, useEffect, useMemo, useCallback, useRef } from "react";', 'import { useState, useEffect, useMemo, useCallback, useRef } from "react";')

# Ensure lucide-react has Archive, Trash2, Mail, MailOpen
lucide_import_match = re.search(r'import {([^}]+)} from "lucide-react";', text)
if lucide_import_match:
    lucide_imports = lucide_import_match.group(1).split(",")
    lucide_imports = [i.strip() for i in lucide_imports if i.strip()]
    for icon in ["Archive", "Trash2", "Mail", "MailOpen"]:
        if icon not in lucide_imports:
            lucide_imports.append(icon)
    new_lucide_import = f"import {{ {', '.join(lucide_imports)} }} from \"lucide-react\";"
    text = text.replace(lucide_import_match.group(0), new_lucide_import)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)

