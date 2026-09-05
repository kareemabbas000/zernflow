with open("app/[locale]/(dashboard)/error.tsx", "r") as f:
    text = f.read()

text = text.replace(
'''        <h2 className="text-lg font-bold text-[var(--ink)] mb-2">
          Unable to load this view
        </h2>
        <p className="text-sm text-[var(--ink-2)] mb-6">
          We encountered a problem while rendering this page. You can try reloading, or contact support if the issue persists.
        </p>''',
'''        <h2 className="text-lg font-bold text-[var(--ink)] mb-2">
          Unable to load this view
        </h2>
        <p className="text-sm text-[var(--ink-2)] mb-6">
          We encountered a problem while rendering this page. You can try reloading, or contact support if the issue persists.
        </p>
        <div className="bg-red-100 text-red-800 p-4 rounded text-left overflow-auto text-xs font-mono mb-6">
          <strong>Error Message:</strong> {error?.message || "Unknown error"}<br/>
          <strong>Stack:</strong> {error?.stack || "No stack trace available"}
        </div>'''
)

with open("app/[locale]/(dashboard)/error.tsx", "w") as f:
    f.write(text)
