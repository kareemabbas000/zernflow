import re

with open("components/inbox/conversation-context-menu.tsx", "r") as f:
    text = f.read()

# Fix setMounted(true) inside useEffect
text = text.replace('setMounted(true);\n    const checkMobile = () => {', 'const checkMobile = () => {')
text = text.replace('useEffect(() => {\n    const checkMobile', 'useEffect(() => {\n    setMounted(true);\n    const checkMobile')

# Wait, if I just remove it from useEffect, it will cause hydration mismatch. 
# It's better to add eslint-disable-next-line
text = text.replace('setMounted(true);', '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setMounted(true);')

with open("components/inbox/conversation-context-menu.tsx", "w") as f:
    f.write(text)

