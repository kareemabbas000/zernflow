with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

# 1. Optimize Lead dropdown text
old_lead = """                <span className="capitalize">
                  {LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]?.label || "Lead"}
                </span>"""
new_lead = """                <span className="capitalize hidden lg:inline-block">
                  {LEAD_STAGES[conversation.contacts?.lead_stage || "lead"]?.label || "Lead"}
                </span>"""
text = text.replace(old_lead, new_lead)

# 2. Optimize Unassigned text
old_unassigned = """                    <span className="max-w-[65px] sm:max-w-[85px] truncate">
                      {assignedMember
                        ? isAssignedToMe
                          ? "Me"
                          : assignedMember.name
                        : "Unassigned"}
                    </span>"""
new_unassigned = """                    <span className="max-w-[65px] sm:max-w-[85px] truncate hidden xl:inline-block">
                      {assignedMember
                        ? isAssignedToMe
                          ? "Me"
                          : assignedMember.name
                        : "Unassigned"}
                    </span>"""
text = text.replace(old_unassigned, new_unassigned)

# 3. Optimize Close/Reopen text
old_close = """              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">Close</span>"""
new_close = """              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xl:inline">Close</span>"""
text = text.replace(old_close, new_close)

old_reopen = """              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">Reopen</span>"""
new_reopen = """              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xl:inline">Reopen</span>"""
text = text.replace(old_reopen, new_reopen)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)
print("Success")
