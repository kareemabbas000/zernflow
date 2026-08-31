import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, GoToFlowNodeData } from "../types";
import { executeFlow } from "../engine";

export async function executeGoToFlow(
  supabase: SupabaseClient<Database>,
  data: GoToFlowNodeData,
  context: FlowExecutionContext,
  _sessionId: string
) {
  // Execute the target flow
  await executeFlow(supabase, {
    ...context,
    flowId: data.flowId,
  });
  // If returnAfter is true, the current flow will continue after the target flow completes
  // For now, we just stop the current traversal
  return "pause";
}
