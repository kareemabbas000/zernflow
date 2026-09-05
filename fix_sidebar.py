import re

with open("components/sidebar.tsx", "r") as f:
    text = f.read()

# We need to wrap the desktop sidebar content in a variable or just duplicate it cleanly.
# Let's extract everything from `{/* Brand Header */}` to the end of the `return` statement.
match = re.search(r'(<div[^>]*style={{ width: sidebarCollapsed \? 64 : 260 }}[^>]*>)(.*)(    </div>\n  \);\n})', text, re.DOTALL)
if match:
    outer_div = match.group(1)
    content = match.group(2)
    end_div = match.group(3)
    
    # We will redefine the mobile block to include the drawer using the EXACT same content.
    mobile_block_match = re.search(r'  if \(isMobile\) \{(.*?)\s+return \(\n\s+<nav className="fixed bottom-0', text, re.DOTALL)
    
    new_mobile_block = """  if (isMobile) {
    return (
      <>
        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--paper)] safe-bottom">
          {mobileNavItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
            const isInbox = item.href === "/dashboard/inbox";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 h-full",
                  isActive ? "text-[var(--brand)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"
                )}
              >
                <div className="relative z-10">
                  <item.icon className="h-5 w-5" />
                  {isInbox && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[8px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Drawer overlay when hamburger is clicked */}
        {!sidebarCollapsed && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" 
              onClick={() => setSidebarCollapsed(true)} 
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-[var(--surface-2)] border-r border-[var(--border)] font-sans text-sm shadow-2xl animate-in slide-in-from-left duration-200">
""" + content + """
            </div>
          </>
        )}
      </>
    );
  }"""
    
    # replace the old mobile block
    old_mobile_block_full = re.search(r'  if \(isMobile\) \{.*?\s+<\/nav>\n    \);\n  \}', text, re.DOTALL).group(0)
    text = text.replace(old_mobile_block_full, new_mobile_block)
    
    with open("components/sidebar.tsx", "w") as f:
        f.write(text)
    print("Sidebar updated successfully!")
else:
    print("Could not find sidebar content")
