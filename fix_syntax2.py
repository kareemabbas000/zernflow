import re

with open("assignee.txt", "r") as f:
    assignee_old = f.read()

with open("options.txt", "r") as f:
    options_old = f.read()

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

assignee_new = """          {/* Team Assignee Custom Popover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {(() => {
                const assignedMember = members.find(
                  (m) => m.userId === conversation.assigned_to,
                );
                const isAssignedToMe =
                  currentUserId && conversation.assigned_to === currentUserId;
                return (
                  <button
                    type="button"
                    disabled={assigning}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs outline-none",
                      assignedMember
                        ? isAssignedToMe
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-[var(--surface)] text-[var(--ink)] border-[var(--border)]"
                        : "bg-[var(--paper)]/80 text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--surface)]",
                    )}
                    title="Assigned team member"
                  >
                    {assignedMember ? (
                      <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[8px] sm:text-[9px] font-bold text-primary-foreground shrink-0">
                        {assignedMember.name.slice(0, 1).toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--ink-2)]" />
                    )}
                    <span className="max-w-[65px] sm:max-w-[85px] truncate">
                      {assignedMember
                        ? isAssignedToMe
                          ? "Me"
                          : assignedMember.name
                        : "Unassigned"}
                    </span>
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
                  </button>
                );
              })()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50">
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                Assign Conversation
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {/* Quick Assign to Me */}
                {currentUserId && (
                  <DropdownMenuItem
                    onClick={() => updateAssignee(currentUserId)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 cursor-pointer text-primary font-semibold focus:bg-primary/10 focus:text-primary"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign to Me</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => updateAssignee(null)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 cursor-pointer",
                    !conversation.assigned_to
                      ? "bg-[var(--surface)] font-bold text-[var(--ink)]"
                      : "text-[var(--ink-2)]"
                  )}
                >
                  <span>Unassigned</span>
                  {!conversation.assigned_to && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {members.length > 0 && (
                <>
                  <DropdownMenuSeparator className="my-1 border-t border-[var(--border)]" />
                  <DropdownMenuGroup className="max-h-48 overflow-y-auto space-y-0.5">
                    {members.map((m) => {
                      const isSelected = conversation.assigned_to === m.userId;
                      return (
                        <DropdownMenuItem
                          key={m.userId}
                          onClick={() => updateAssignee(m.userId)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 cursor-pointer",
                            isSelected
                              ? "bg-primary/10 text-primary font-bold focus:bg-primary/20 focus:text-primary"
                              : "text-[var(--ink)]"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary shrink-0">
                              {m.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex flex-col">
                              <span className="truncate text-xs">{m.name}</span>
                              <span className="text-[9px] text-[var(--ink-2)] capitalize">
                                {m.role}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>\n"""

options_new = """          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors outline-none cursor-pointer"
                title="Chat Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50">
              <DropdownMenuItem
                onClick={() =>
                  updateConversationStatus(
                    conversation.status === "open" ? "closed" : "open",
                  )
                }
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer"
              >
                {conversation.status === "open" ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                    <span>Mark as Closed</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    <span>Reopen Chat</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleMute}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer"
              >
                {conversation.is_muted ? (
                  <>
                    <BellOff className="h-3.5 w-3.5 text-primary" />
                    <span>Unmute Notifications</span>
                  </>
                ) : (
                  <>
                    <BellOff className="h-3.5 w-3.5 text-[var(--ink-2)]" />
                    <span>Mute Notifications</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleAutomation}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer"
              >
                {conversation.is_automation_paused ? (
                  <>
                    <Bot className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Resume AI Bot</span>
                  </>
                ) : (
                  <>
                    <BotOff className="h-3.5 w-3.5 text-rose-500" />
                    <span>Pause AI Bot</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-t border-[var(--border)]" />
              <DropdownMenuItem
                onClick={() => updateConversationStatus("snoozed")}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Snooze Chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateConversationStatus("archived")}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5 text-indigo-500" />
                <span>Archive Chat</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-t border-[var(--border)]" />
              <DropdownMenuItem
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>\n"""

# Note: removing a trailing newline if it exists on assignee_old or options_old to match accurately.
text = text.replace(assignee_old, assignee_new)
text = text.replace(options_old, options_new)

# Make double sure we remove any lingering `menuOpen` and `assigneeMenuOpen` state declarations in message-thread.tsx
text = re.sub(r'  const \[menuOpen, setMenuOpen\] = useState\(.*?\);\n', '', text)
text = re.sub(r'  const \[assigneeMenuOpen, setAssigneeMenuOpen\] = useState\(.*?\);\n', '', text)
# And just in case stageMenuOpen somehow survived
text = re.sub(r'  const \[stageMenuOpen, setStageMenuOpen\] = useState\(.*?\);\n', '', text)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

