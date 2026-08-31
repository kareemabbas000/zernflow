import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, PrivateReplyNodeData } from "../types";
import { createZernioClient } from "@/lib/zernio-client";
import { interpolateVariables } from "../utils";

/**
 * Send a private DM to the commenter via the Zernio API's private reply endpoint.
 * This creates a DM conversation from a comment context.
 */
export async function executePrivateReply(
  supabase: SupabaseClient<Database>,
  data: PrivateReplyNodeData,
  context: FlowExecutionContext
) {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted")
    .eq("id", context.workspaceId)
    .single();

  const apiKey = workspace?.late_api_key_encrypted || process.env.ZERNIO_API_KEY;
  if (!apiKey) return;

  const zernio = createZernioClient(apiKey);

  // Resolve late_account_id
  let lateAccountId = context.lateAccountId;
  if (!lateAccountId) {
    const { data: channel } = await supabase
      .from("channels")
      .select("late_account_id")
      .eq("id", context.channelId)
      .single();

    if (!channel) return;
    lateAccountId = channel.late_account_id;
  }

  const commentId = context.variables?.comment_id || context.incomingMessage.sender?.id;
  if (!commentId) return;

  const postId = context.variables?.post_id;
  if (!postId) {
    console.error("No post_id in context variables for privateReply node");
    return;
  }

  const text = interpolateVariables(data.text, context.variables || {});

  try {
    await zernio.comments.sendPrivateReplyToComment({
      path: { postId, commentId },
      body: { accountId: lateAccountId, message: text },
    });

    await supabase.from("messages").insert({
      conversation_id: context.conversationId,
      direction: "outbound",
      text,
      attachments: data.imageUrl
        ? [{ type: "image", url: data.imageUrl }]
        : null,
      sent_by_flow_id: context.flowId,
      status: "sent",
    });
  } catch (error) {
    console.error("Failed to send private reply:", error);
    await supabase.from("messages").insert({
      conversation_id: context.conversationId,
      direction: "outbound",
      text,
      sent_by_flow_id: context.flowId,
      status: "failed",
    });
  }
}
