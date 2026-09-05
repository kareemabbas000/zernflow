import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Add effect to reset userScrolled on conversation change
reset_code = """  useEffect(() => {
    setUserScrolled(false);
  }, [conversation?.id]);

"""

# Add it before the userScrolledRef
text = text.replace(
    'const [userScrolled, setUserScrolled] = useState(false);',
    reset_code + '  const [userScrolled, setUserScrolled] = useState(false);'
)

# Update the messages.length effect to use setTimeout for layout stability
new_messages_effect = """  useEffect(() => {
    // When messages change (new message sent/received or loaded), scroll down
    if (!userScrolledRef.current && messagesEndRef.current) {
      // Small timeout to allow layout shifts (e.g. from avatars/images) to settle
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }, 50);
    }
  }, [messages.length, conversation?.id]);"""

old_messages_effect = r"  useEffect\(\(\) => \{\n    // When messages change \(new message sent/received or loaded\), scroll down\n    if \(\!userScrolledRef\.current && messagesEndRef\.current\) \{\n      messagesEndRef\.current\.scrollIntoView\(\{ behavior: \"instant\" \}\);\n    \}\n  \}, \[messages\.length\]\);"

text = re.sub(old_messages_effect, new_messages_effect, text)

# Also update the ResizeObserver effect to use requestAnimationFrame for smoother behavior
old_ro_effect = r"  useEffect\(\(\) => \{\n    const container = scrollContainerRef\.current;\n    if \(\!container\) return;\n\n    const scrollToBottom = \(behavior: ScrollBehavior = \"smooth\"\) => \{\n      if \(messagesEndRef\.current\) \{\n        messagesEndRef\.current\.scrollIntoView\(\{ behavior \}\);\n      \}\n    \};\n\n    // Only scroll instantly when the conversation changes\n    scrollToBottom\(\"instant\"\);\n\n    const observer = new ResizeObserver\(\(\) => \{\n      // Use the ref to avoid stale closures and infinite re-renders\n      if \(\!userScrolledRef\.current\) \{\n        scrollToBottom\(\"smooth\"\);\n      \}\n    \}\);\n\n    observer\.observe\(container\);\n    return \(\) => observer\.disconnect\(\);\n  \}, \[conversation\?\.id\]\);"

new_ro_effect = """  useEffect(() => {
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
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [conversation?.id]);"""

text = re.sub(old_ro_effect, new_ro_effect, text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

