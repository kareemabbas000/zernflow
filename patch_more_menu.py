import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

menu_old = """          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1 shadow-lg z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() =>
                      updateConversationStatus(
                        conversation.status === "snoozed" ? "open" : "snoozed",
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {conversation.status === "snoozed"
                        ? "Unsnooze"
                        : "Snooze"}
                    </span>
                  </button>

                  <button
                    onClick={() => updateConversationStatus("archived")}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Archive Chat</span>
                  </button>

                  <div className="my-1 border-t border-[var(--border)]" />

                  <button
                    onClick={deleteConversation}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-red-500 hover:bg-red-50 transition-colors cursor-pointer font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>"""

menu_new = """          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors outline-none"
                title="Chat Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    updateConversationStatus(
                      conversation.status === "snoozed" ? "open" : "snoozed",
                    )
                  }
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--ink-2)] cursor-pointer focus:bg-[var(--surface)] focus:text-[var(--ink)]"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {conversation.status === "snoozed"
                      ? "Unsnooze"
                      : "Snooze"}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => updateConversationStatus("archived")}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--ink-2)] cursor-pointer focus:bg-[var(--surface)] focus:text-[var(--ink)]"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive Chat</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={deleteConversation}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-500 font-medium cursor-pointer focus:bg-red-50 focus:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>"""

text = text.replace(menu_old, menu_new)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

