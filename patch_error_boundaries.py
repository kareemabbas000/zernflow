import re

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "r") as f:
    text = f.read()

# Make sure we import ErrorBoundary
if "react-error-boundary" not in text:
    text = re.sub(r'(import .*?;\n)', r'\1import { ErrorBoundary } from "react-error-boundary";\n', text, count=1)

# Wrap MessageThread
text = text.replace(
    '<MessageThread',
    '<ErrorBoundary fallback={<div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200">MessageThread crashed.</div></div>}><MessageThread'
)
text = text.replace(
    'isProfileOpen={contactPanelOpen}\n                  />',
    'isProfileOpen={contactPanelOpen}\n                  /></ErrorBoundary>'
)

# Wrap ContactPanel
text = text.replace(
    '<ContactPanel',
    '<ErrorBoundary fallback={<div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200">ContactPanel crashed.</div></div>}><ContactPanel'
)
text = text.replace(
    'isMobile={isMobile}\n                        />',
    'isMobile={isMobile}\n                        /></ErrorBoundary>'
)

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "w") as f:
    f.write(text)

