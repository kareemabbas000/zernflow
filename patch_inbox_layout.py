with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "r") as f:
    text = f.read()

old_layout = 'className="flex h-[calc(100vh-64px)] w-full bg-[var(--surface-2)] overflow-hidden font-sans"'
new_layout = 'className="flex h-[calc(100dvh-64px)] w-full bg-[var(--surface-2)] overflow-hidden font-sans"'

text = text.replace(old_layout, new_layout)

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "w") as f:
    f.write(text)

