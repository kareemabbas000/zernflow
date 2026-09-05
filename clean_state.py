import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

text = re.sub(r'  const \[stageMenuOpen, setStageMenuOpen\] = useState\(false\);\n', '', text)
text = re.sub(r'  const \[assigneeMenuOpen, setAssigneeMenuOpen\] = useState\(false\);\n', '', text)
text = re.sub(r'  const \[menuOpen, setMenuOpen\] = useState\(false\);\n', '', text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

