with open("app/[locale]/layout.tsx", "r") as f:
    text = f.read()

old_toaster = "<Toaster />"
new_toaster = """<Toaster 
              position="top-center" 
              expand={false} 
              duration={3000} 
              toastOptions={{ 
                className: "backdrop-blur-xl bg-white/60 dark:bg-black/60 border border-[var(--border)] shadow-2xl rounded-2xl font-sans text-[var(--ink)] overflow-hidden" 
              }} 
            />"""

text = text.replace(old_toaster, new_toaster)

with open("app/[locale]/layout.tsx", "w") as f:
    f.write(text)

