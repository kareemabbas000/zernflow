import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# First, create the userScrolledRef
text = text.replace(
    'const [userScrolled, setUserScrolled] = useState(false);',
    'const [userScrolled, setUserScrolled] = useState(false);\n  const userScrolledRef = useRef(userScrolled);\n  useEffect(() => { userScrolledRef.current = userScrolled; }, [userScrolled]);'
)

# Then fix the ResizeObserver useEffect
old_effect = """  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    scrollToBottom("instant");

    const observer = new ResizeObserver(() => {
      if (!userScrolled) {
        scrollToBottom("smooth");
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [conversation?.id, messages.length, userScrolled]);"""

new_effect = """  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    };

    // Only scroll instantly when the conversation changes
    scrollToBottom("instant");

    const observer = new ResizeObserver(() => {
      // Use the ref to avoid stale closures and infinite re-renders
      if (!userScrolledRef.current) {
        scrollToBottom("smooth");
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [conversation?.id]); // ONLY re-run when conversation changes"""

if old_effect in text:
    text = text.replace(old_effect, new_effect)
else:
    # If indentation is different, we can use regex
    regex = r"  useEffect\(\(\) => \{\n    const container = scrollContainerRef\.current;.*?return \(\) => observer\.disconnect\(\);\n  \}, \[conversation\?\.id, messages\.length, userScrolled\]\);"
    text = re.sub(regex, new_effect, text, flags=re.DOTALL)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

