import re

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "r") as f:
    text = f.read()

# Replace the simple string with a fallbackRender function to show the error
text = text.replace(
    '<ErrorBoundary fallback={<div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200">MessageThread crashed.</div></div>}>',
    '<ErrorBoundary fallbackRender={({ error }) => <div className="flex h-full items-center justify-center p-4"><div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-200 max-w-full overflow-auto"><h3 className="font-bold">MessageThread crashed:</h3><pre className="text-xs mt-2">{error.message}</pre><pre className="text-[9px] mt-2 opacity-70">{error.stack}</pre></div></div>}>'
)

with open("app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx", "w") as f:
    f.write(text)

