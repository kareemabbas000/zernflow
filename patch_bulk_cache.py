with open("components/inbox/conversation-list.tsx", "r") as f:
    text = f.read()

old_code = """      // Since we don't have SWR hooked into this specific component directly for refresh,
      // we just clear selection. A real implementation would queryClient.invalidateQueries()
      clearSelection();"""

new_code = """      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      clearSelection();"""

text = text.replace(old_code, new_code)

with open("components/inbox/conversation-list.tsx", "w") as f:
    f.write(text)
