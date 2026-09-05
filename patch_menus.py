import re

with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# 1. Add the import
if "import { DropdownMenu" not in text:
    text = text.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu";')

# 2. Replace the Lead Stage menu
lead_stage_old = """          {/* Lead Stage Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setStageMenuOpen(!stageMenuOpen);
                setAssigneeMenuOpen(false);
                setMenuOpen(false);
              }}
              disabled={updatingStage}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shadow-2xs",
                LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                  ?.badgeClass ||
                  "bg-[var(--surface)]/60 text-[var(--ink-2)] border-[var(--border)]",
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                  LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                    ?.colorClass || "bg-gray-500",
                )}
              />
              <span className="capitalize">
                {conversation.contacts?.lead_stage || "Lead"}
              </span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
            </button>

            {stageMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStageMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                    CRM Lead Stage
                  </p>
                  <div className="space-y-0.5">
                    {LEAD_STAGE_OPTIONS.map((stage) => {
                      const isSelected =
                        (conversation.contacts?.lead_stage || "lead") === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            updateLeadStage(stage);
                            setStageMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-[var(--ink)] hover:bg-[var(--surface)]",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                LEAD_STAGES[stage]?.colorClass,
                              )}
                            />
                            <span className="capitalize">{stage}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>"""

lead_stage_new = """          {/* Lead Stage Toggle */}
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
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                    LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]
                      ?.colorClass || "bg-gray-500",
                  )}
                />
                <span className="capitalize">
                  {conversation.contacts?.lead_stage || "Lead"}
                </span>
                <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1.5">
              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider">
                CRM Lead Stage
              </DropdownMenuLabel>
              <DropdownMenuGroup className="space-y-0.5">
                {LEAD_STAGE_OPTIONS.map((stage) => {
                  const isSelected =
                    (conversation.contacts?.lead_stage || "lead") === stage;
                  return (
                    <DropdownMenuItem
                      key={stage}
                      onClick={() => updateLeadStage(stage)}
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
                            LEAD_STAGES[stage]?.colorClass,
                          )}
                        />
                        <span className="capitalize">{stage}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>"""

text = text.replace(lead_stage_old, lead_stage_new)

# 3. Replace the Assignee menu
# Wait, let's just do a regex sub or a more robust replacement for Assignee and Menu since it's hard to match exactly.
