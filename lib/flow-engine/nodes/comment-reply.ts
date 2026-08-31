import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, CommentReplyNodeData } from "../types";
import { createZernioClient } from "@/lib/zernio-client";
import { interpolateVariables } from "../utils";

/**
 * Post a public reply to the comment that triggered this flow.
 * Uses the comment_id and post_id variables set by the comment processor.
 */
export async function executeCommentReply(
  supabase: SupabaseClient<Database>,
  data: CommentReplyNodeData,
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
    console.error("No post_id in context variables for commentReply node");
    return;
  }

  const text = interpolateVariables(data.text, context.variables || {});

  try {
    await zernio.comments.replyToInboxPost({
      path: { postId },
      body: { accountId: lateAccountId, message: text, commentId },
    });
  } catch (error) {
    console.error("Failed to post comment reply:", error);
  }
}
