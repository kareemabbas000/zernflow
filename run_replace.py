import re

with open("lead_stage.txt", "r") as f:
    old_block = f.read()

# Remove the first div line because we just want to replace the `<!-- CRM Lead Stage Custom Popover -->` block
old_block = old_block.split('        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto flex-wrap justify-between sm:justify-end pb-1 sm:pb-0">\n')[1]
old_block = old_block.strip()

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

new_block = """          {/* CRM Lead Stage Custom Popover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={updatingStage}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs outline-none",
                  LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                    ?.badgeClass ||
                    "bg-[var(--surface)]/60 text-[var(--ink-2)] border-[var(--border)]",
                )}
                title="CRM Lead Stage"
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]?.dot || "bg-gray-500",
                  )}
                />
                <span className="capitalize">
                  {LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]?.label || "Lead"}
                </span>
                <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1.5 bg-[var(--paper)] border-[var(--border)] shadow-xl z-50">
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                CRM Lead Stage
              </DropdownMenuLabel>
              <DropdownMenuGroup className="space-y-0.5">
                {LEAD_STAGE_OPTIONS.map((opt) => {
                  const isSelected =
                    (conversation.contacts?.lead_stage || "lead") === opt.id;
                  return (
                    <DropdownMenuItem
                      key={opt.id}
                      onClick={() => updateLeadStage(opt.id)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2.5 py-1.5 cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold focus:bg-primary/20 focus:text-primary"
                          : "text-[var(--ink)]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            opt.dot || "bg-gray-500",
                          )}
                        />
                        <span className="capitalize">{opt.label || opt.id}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>"""

text = text.replace(old_block, new_block)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

