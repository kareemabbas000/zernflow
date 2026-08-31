import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, EnrollSequenceNodeData } from "../types";

export async function executeEnrollSequence(
  supabase: SupabaseClient<Database>,
  data: EnrollSequenceNodeData,
  context: FlowExecutionContext
) {
  if (!data.sequenceId) {
    console.error("enrollSequence node missing sequenceId");
    return;
  }

  // Verify sequence exists and is active
  const { data: sequence } = await supabase
    .from("sequences")
    .select("id, steps, status")
    .eq("id", data.sequenceId)
    .single();

  if (!sequence || sequence.status !== "active") {
    console.error("Sequence not found or not active:", data.sequenceId);
    return;
  }

  const steps = (sequence.steps as Array<{ type: string; delayMinutes?: number }>) || [];
  if (steps.length === 0) return;

  // Calculate next_step_at based on first step
  let nextStepAt: string;
  const firstStep = steps[0];
  if (firstStep.type === "delay" && firstStep.delayMinutes) {
    nextStepAt = new Date(
      Date.now() + firstStep.delayMinutes * 60 * 1000
    ).toISOString();
  } else {
    nextStepAt = new Date().toISOString();
  }

  // Create enrollment (ignore duplicate errors)
  const { error } = await supabase
    .from("sequence_enrollments")
    .insert({
      sequence_id: data.sequenceId,
      contact_id: context.contactId,
      channel_id: context.channelId,
      next_step_at: nextStepAt,
    });

  if (error && error.code !== "23505") {
    console.error("Failed to enroll contact in sequence:", error);
  }
}
