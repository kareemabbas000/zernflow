with open("components/providers/global-live-sync-provider.tsx", "r") as f:
    text = f.read()

# Fix the missing channels relation in realtime sync
text = text.replace('.select("*, contacts(*)")', '.select("*, contacts(*), channels(*)")')

with open("components/providers/global-live-sync-provider.tsx", "w") as f:
    f.write(text)
print("Success")
