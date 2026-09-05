import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

assignee_old = """          {/* Assignee Toggle */}
          <div className="relative">
            {(() => {
              const isAssignedToMe =
                conversation.assigned_to &&
                currentUserId &&
                conversation.assigned_to === currentUserId;
              const assignedMember = members.find(
                (m) => m.userId === conversation.assigned_to,
              );

              return (
                <>
                  <button
                    onClick={() => {
                      setAssigneeMenuOpen(!assigneeMenuOpen);
                      setStageMenuOpen(false);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
                      conversation.assigned_to
                        ? "bg-primary/5 text-primary border-primary/20"
                        : "bg-[var(--surface)]/60 text-[var(--ink-2)] border-[var(--border)]",
                    )}
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

                  {assigneeMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAssigneeMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-52 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <p className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                          Assign Conversation
                        </p>

                        {/* Quick Assign to Me */}
                        {currentUserId && (
                          <button
                            type="button"
                            onClick={() => updateAssignee(currentUserId)}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-primary hover:bg-primary/10 transition-colors font-semibold cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Assign to Me</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => updateAssignee(null)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                            !conversation.assigned_to
                              ? "bg-[var(--surface)] font-bold text-[var(--ink)]"
                              : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
                          )}
                        >
                          <span>Unassigned</span>
                          {!conversation.assigned_to && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {members.length > 0 && (
                          <>
                            <div className="my-1 border-t border-[var(--border)]" />
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                              {members.map((m) => {
                                const isSelected =
                                  conversation.assigned_to === m.userId;
                                return (
                                  <button
                                    key={m.userId}
                                    type="button"
                                    onClick={() => updateAssignee(m.userId)}
                                    className={cn(
                                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                                      isSelected
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-[var(--ink)] hover:bg-[var(--surface)]",
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary shrink-0">
                                        {m.name.slice(0, 1).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex flex-col">
                                        <span className="truncate text-xs">
                                          {m.name}
                                        </span>
                                        <span className="text-[9px] text-[var(--ink-2)] capitalize">
                                          {m.role}
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>"""


assignee_new = """          {/* Assignee Toggle */}
          <DropdownMenu>
            {(() => {
              const isAssignedToMe =
                conversation.assigned_to &&
                currentUserId &&
                conversation.assigned_to === currentUserId;
              const assignedMember = members.find(
                (m) => m.userId === conversation.assigned_to,
              );

              return (
                <>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs outline-none",
                        conversation.assigned_to
                          ? "bg-primary/5 text-primary border-primary/20"
                          : "bg-[var(--surface)]/60 text-[var(--ink-2)] border-[var(--border)]",
                      )}
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
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52 p-1.5">
                    <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                      Assign Conversation
                    </DropdownMenuLabel>

                    <DropdownMenuGroup>
                      {/* Quick Assign to Me */}
                      {currentUserId && (
                        <DropdownMenuItem
                          onClick={() => updateAssignee(currentUserId)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-primary focus:bg-primary/10 focus:text-primary font-semibold cursor-pointer text-xs"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Assign to Me</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => updateAssignee(null)}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 cursor-pointer text-xs",
                          !conversation.assigned_to
                            ? "bg-[var(--surface)] font-bold text-[var(--ink)]"
                            : "text-[var(--ink-2)] focus:bg-[var(--surface)] focus:text-[var(--ink)]",
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
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuGroup className="max-h-48 overflow-y-auto">
                          {members.map((m) => {
                            const isSelected = conversation.assigned_to === m.userId;
                            return (
                              <DropdownMenuItem
                                key={m.userId}
                                onClick={() => updateAssignee(m.userId)}
                                className={cn(
                                  "flex items-center justify-between px-2.5 py-1.5 cursor-pointer text-xs",
                                  isSelected
                                    ? "bg-primary/10 text-primary font-bold focus:bg-primary/20 focus:text-primary"
                                    : "text-[var(--ink)] focus:bg-[var(--surface)]",
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary shrink-0">
                                    {m.name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex flex-col">
                                    <span className="truncate text-xs">
                                      {m.name}
                                    </span>
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
                </>
              );
            })()}
          </DropdownMenu>"""

text = text.replace(assignee_old, assignee_new)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

