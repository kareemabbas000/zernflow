import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, ConditionNodeData } from "../types";

export function evaluateCondition(
  actual: string | undefined,
  operator: string,
  expected: string
): boolean {
  switch (operator) {
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "contains":
      return actual?.includes(expected) || false;
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    case "gt":
      return Number(actual) > Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    default:
      return false;
  }
}

export async function executeCondition(
  supabase: SupabaseClient<Database>,
  data: ConditionNodeData,
  context: FlowExecutionContext
): Promise<string> {
  const { data: contact } = await supabase
    .from("contacts")
    .select("*, contact_tags(tag_id, tags(name)), contact_custom_fields(field_id, value, custom_field_definitions(slug))")
    .eq("id", context.contactId)
    .single();

  if (!contact) return "handle:false";

  const results = data.conditions.map((condition) => {
    let fieldValue: string | undefined;

    // Check built-in fields
    if (condition.field === "platform") {
      fieldValue = context.platform;
    } else if (condition.field === "is_subscribed") {
      fieldValue = String(contact.is_subscribed);
    } else if (condition.field.startsWith("tag:")) {
      const tagName = condition.field.replace("tag:", "");
      const hasTags = Array.isArray(contact.contact_tags);
      const hasTag = hasTags && (contact.contact_tags as Array<{ tags: { name: string } | null }>).some(
        (ct) => ct.tags?.name === tagName
      );
      fieldValue = String(hasTag);
    } else if (condition.field.startsWith("variable:")) {
      const varName = condition.field.replace("variable:", "");
      fieldValue = context.variables?.[varName];
    } else {
      // Check custom fields
      const customFields = contact.contact_custom_fields as Array<{
        value: string;
        custom_field_definitions: { slug: string } | null;
      }> | null;
      const field = customFields?.find(
        (f) => f.custom_field_definitions?.slug === condition.field
      );
      fieldValue = field?.value;
    }

    return evaluateCondition(fieldValue, condition.operator, condition.value);
  });

  const passed =
    data.logic === "and" ? results.every(Boolean) : results.some(Boolean);

  return passed ? "handle:true" : "handle:false";
}
