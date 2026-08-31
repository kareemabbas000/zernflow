import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, TagNodeData } from "../types";

export async function executeTag(
  supabase: SupabaseClient<Database>,
  data: TagNodeData & { action: "add" | "remove" },
  context: FlowExecutionContext
) {
  // Find or create tag
  const { data: tag } = await supabase
    .from("tags")
    .upsert(
      { workspace_id: context.workspaceId, name: data.tagName },
      { onConflict: "workspace_id,name" }
    )
    .select("id")
    .single();

  if (!tag) return;

  if (data.action === "add") {
    await supabase
      .from("contact_tags")
      .upsert({ contact_id: context.contactId, tag_id: tag.id })
      .select();
  } else {
    await supabase
      .from("contact_tags")
      .delete()
      .eq("contact_id", context.contactId)
      .eq("tag_id", tag.id);
  }
}
