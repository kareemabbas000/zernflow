import re

with open("/Users/KareemAbbas/.gemini/antigravity-ide/brain/cd36edff-d014-488d-97ec-f9be3d6a79e6/implementation_plan.md", "r") as f:
    text = f.read()

bug_fix_section = """### 5. Channel Badge Disappearance Bug
**Problem**: When the live inbox receives a realtime update (e.g. status change, new message), the channel badge suddenly disappears. This occurs because Supabase realtime payloads only include the root row data, stripping out the nested `channels` and `contacts` relations, which accidentally overwrites and erases the UI state.
#### [MODIFY] `lib/stores/inbox-store.ts`
- Update the `upsertConversation` function to intelligently merge incoming realtime payloads with existing state, specifically preserving the `channels` and `contacts` objects if they are missing from the incoming payload.

"""

if "Channel Badge Disappearance Bug" not in text:
    text = text.replace("## Open Questions", bug_fix_section + "## Open Questions")

with open("/Users/KareemAbbas/.gemini/antigravity-ide/brain/cd36edff-d014-488d-97ec-f9be3d6a79e6/implementation_plan.md", "w") as f:
    f.write(text)

