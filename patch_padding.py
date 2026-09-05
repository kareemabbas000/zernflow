with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

old_composer = """      {/* Bottom Composer */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-4xl p-2 md:p-3">"""

new_composer = """      {/* Bottom Composer */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-4xl p-2 md:p-3">"""

text = text.replace(old_composer, new_composer)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

