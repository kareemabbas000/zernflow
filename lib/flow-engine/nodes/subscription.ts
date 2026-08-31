import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext } from "../types";

export async function executeSubscription(
  supabase: SupabaseClient<Database>,
  action: string,
  context: FlowExecutionContext
) {
  await supabase
    .from("contacts")
    .update({ is_subscribed: action === "subscribe" })
    .eq("id", context.contactId);
}
