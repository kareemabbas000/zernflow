import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Let's add a useEffect specifically for messages.length changing
new_code = """  useEffect(() => {
    // When messages change (new message sent/received or loaded), scroll down
    if (!userScrolledRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages.length]);
"""

# Insert it right after the existing scroll useEffect
old_effect = r"observer\.disconnect\(\);\n  \}, \[conversation\?\.id\]\); // ONLY re-run when conversation changes"

if re.search(old_effect, text):
    text = re.sub(old_effect, "observer.disconnect();\n  }, [conversation?.id]);\n\n" + new_code, text)
else:
    print("Could not find the target to insert new effect.")

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

