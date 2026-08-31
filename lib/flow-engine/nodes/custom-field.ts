import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, SetFieldNodeData } from "../types";
import { interpolateVariables } from "../utils";

export async function executeSetField(
  supabase: SupabaseClient<Database>,
  data: SetFieldNodeData,
  context: FlowExecutionContext
) {
  if (!data.fieldSlug) return;
  const value = interpolateVariables(data.value, context.variables || {});

  // Update context variables
  if (context.variables) {
    context.variables[data.fieldSlug] = value;
  }

  // Update standard contact columns if field matches
  const slug = data.fieldSlug.toLowerCase();
  if (slug === "name" || slug === "display_name") {
    await supabase.from("contacts").update({ display_name: value }).eq("id", context.contactId);
  } else if (slug === "email") {
    await supabase.from("contacts").update({ email: value }).eq("id", context.contactId);
  }

  // Find or create field definition
  const { data: fieldDef } = await supabase
    .from("custom_field_definitions")
    .select("id")
    .eq("workspace_id", context.workspaceId)
    .eq("slug", data.fieldSlug)
    .maybeSingle();

  let fieldId = fieldDef?.id;
  if (!fieldId) {
    const { data: newField } = await supabase
      .from("custom_field_definitions")
      .insert({
        workspace_id: context.workspaceId,
        name: data.fieldSlug,
        slug: data.fieldSlug,
        type: "text",
      })
      .select("id")
      .maybeSingle();
    fieldId = newField?.id;
  }

  if (fieldId) {
    await supabase.from("contact_custom_fields").upsert(
      {
        contact_id: context.contactId,
        field_id: fieldId,
        value,
      },
      { onConflict: "contact_id,field_id" }
    );
  }
}
