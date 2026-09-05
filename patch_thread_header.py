import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# Make composer smaller:
text = text.replace(
    '      {/* Bottom Composer */}\n      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30">\n        <div className="mx-auto max-w-4xl p-3 md:p-4">',
    '      {/* Bottom Composer */}\n      <div className="border-t border-[var(--border)] bg-[var(--surface)] shrink-0 z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">\n        <div className="mx-auto max-w-4xl p-2 md:p-3">'
)
text = text.replace(
    '          <div className="flex items-center gap-1 mb-2 px-1">\n            <button\n              onClick={() => setIsInternal(false)}\n              className={cn(\n                "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all",\n                !isInternal\n                  ? "bg-[var(--brand)] text-white shadow-sm"\n                  : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]",\n              )}\n            >\n              CUSTOMER REPLY\n            </button>\n            <button\n              onClick={() => setIsInternal(true)}\n              className={cn(\n                "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all",\n                isInternal\n                  ? "bg-amber-500 text-white shadow-sm"\n                  : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]",\n              )}\n            >\n              INTERNAL NOTE\n            </button>\n          </div>',
    '          <div className="flex items-center gap-1 mb-1.5 px-1">\n            <button\n              onClick={() => setIsInternal(false)}\n              className={cn(\n                "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all",\n                !isInternal\n                  ? "bg-[var(--brand)] text-white shadow-sm"\n                  : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]",\n              )}\n            >\n              Customer Reply\n            </button>\n            <button\n              onClick={() => setIsInternal(true)}\n              className={cn(\n                "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all",\n                isInternal\n                  ? "bg-amber-500 text-white shadow-sm"\n                  : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]",\n              )}\n            >\n              Internal Note\n            </button>\n          </div>'
)
text = text.replace(
    '            <textarea\n              ref={textareaRef}\n              value={input}\n              onChange={(e) => {\n                setInput(e.target.value);\n                setTimeout(autoResize, 0);\n              }}\n              onKeyDown={(e) => {\n                if (e.key === "Enter" && !e.shiftKey) {\n                  e.preventDefault();\n                  handleSend();\n                }\n              }}\n              className="w-full bg-transparent p-3 md:p-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-3)] resize-none outline-none min-h-[44px] max-h-[160px]"\n              placeholder=',
    '            <textarea\n              ref={textareaRef}\n              value={input}\n              onChange={(e) => {\n                setInput(e.target.value);\n                setTimeout(autoResize, 0);\n              }}\n              onKeyDown={(e) => {\n                if (e.key === "Enter" && !e.shiftKey) {\n                  e.preventDefault();\n                  handleSend();\n                }\n              }}\n              className="w-full bg-transparent p-2.5 md:p-3 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-3)] resize-none outline-none min-h-[38px] max-h-[140px] leading-relaxed"\n              placeholder='
)


with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)
