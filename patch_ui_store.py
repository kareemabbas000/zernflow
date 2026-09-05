import re

with open("lib/stores/ui-store.ts", "r") as f:
    text = f.read()

# Default to false
text = text.replace('contactPanelOpen: true,', 'contactPanelOpen: false,')

# When breakpoint changes, do not force it open on desktop
text = text.replace('contactPanelOpen: bp !== "mobile",', 'contactPanelOpen: false, // Do not auto-open on desktop')

with open("lib/stores/ui-store.ts", "w") as f:
    f.write(text)

