import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowNode, FlowExecutionContext } from "./types";

import { executeSendMessage } from "./nodes/send-message";
import { executeCondition } from "./nodes/condition";
import { executeDelay } from "./nodes/delay";
import { executeTag } from "./nodes/tags";
import { executeSetField } from "./nodes/custom-field";
import { executeHttpRequest } from "./nodes/http-request";
import { executeGoToFlow } from "./nodes/go-to-flow";
import { executeHumanTakeover } from "./nodes/human-takeover";
import { executeSubscription } from "./nodes/subscription";
import { executeABSplit } from "./nodes/ab-split";
import { executeCommentReply } from "./nodes/comment-reply";
import { executePrivateReply } from "./nodes/private-reply";
import { executeAiResponse } from "./nodes/ai-response";
import { executeEnrollSequence } from "./nodes/enroll-sequence";

export type NodeExecutionResult = string | void | "pause";

export type NodeHandler = (
  supabase: SupabaseClient<Database>,
  node: FlowNode,
  context: FlowExecutionContext,
  sessionId: string
) => Promise<NodeExecutionResult> | NodeExecutionResult;

export const nodeRegistry: Record<string, NodeHandler> = {
  sendMessage: (supabase, node, context) => executeSendMessage(supabase, node.data as any, context),
  condition: (supabase, node, context) => executeCondition(supabase, node.data as any, context),
  delay: (supabase, node, context, sessionId) => executeDelay(supabase, node.data as any, sessionId, node.id, context),
  addTag: (supabase, node, context) => executeTag(supabase, { ...node.data as any, action: "add" }, context),
  removeTag: (supabase, node, context) => executeTag(supabase, { ...node.data as any, action: "remove" }, context),
  setCustomField: (supabase, node, context) => executeSetField(supabase, node.data as any, context),
  httpRequest: (supabase, node, context) => executeHttpRequest(node.data as any, context),
  goToFlow: (supabase, node, context, sessionId) => executeGoToFlow(supabase, node.data as any, context, sessionId),
  humanTakeover: (supabase, node, context, sessionId) => executeHumanTakeover(supabase, context, sessionId),
  subscribe: (supabase, node, context) => executeSubscription(supabase, "subscribe", context),
  unsubscribe: (supabase, node, context) => executeSubscription(supabase, "unsubscribe", context),
  commentReply: (supabase, node, context) => executeCommentReply(supabase, node.data as any, context),
  privateReply: (supabase, node, context) => executePrivateReply(supabase, node.data as any, context),
  aiResponse: (supabase, node, context, sessionId) => executeAiResponse(supabase, node.data as any, context, sessionId),
  abSplit: (supabase, node) => executeABSplit(node.data as any),
  smartDelay: async (supabase, node, context, sessionId) => {
    const data = node.data as any;
    const timeout = data.timeout || 30;
    const unit = data.timeoutUnit || "minutes";
    
    const multipliers: Record<string, number> = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    
    const delayMs = timeout * (multipliers[unit] || 60000);
    const runAt = new Date(Date.now() + delayMs).toISOString();

    // Schedule a timeout job to resume flow if user doesn't reply
    await supabase.from("scheduled_jobs").insert({
      type: "resume_flow",
      payload: {
        sessionId,
        nodeId: node.id,
        flowId: context.flowId,
        channelId: context.channelId,
        contactId: context.contactId,
        conversationId: context.conversationId,
        workspaceId: context.workspaceId,
        lateConversationId: context.lateConversationId || null,
        lateAccountId: context.lateAccountId || null,
        variables: context.variables || {},
      },
      run_at: runAt,
    });

    await supabase
      .from("flow_sessions")
      .update({ waiting_for_input: true, waiting_until: runAt, current_node_id: node.id })
      .eq("id", sessionId);
    return "pause";
  },
  enrollSequence: (supabase, node, context) => executeEnrollSequence(supabase, node.data as any, context),
};
