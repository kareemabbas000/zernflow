import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, SendMessageNodeData } from "../types";
import { createZernioClient } from "@/lib/zernio-client";
import { adaptMessage } from "../platform-adapter";
import { interpolateVariables } from "../utils";

export async function sendFirstMessageAsPrivateReply(
  supabase: SupabaseClient<Database>,
  zernio: ReturnType<typeof createZernioClient>,
  data: SendMessageNodeData,
  context: FlowExecutionContext,
  lateAccountId: string
) {
  const rawList =
    Array.isArray(data.messages) && data.messages.length > 0
      ? data.messages
      : (data as any).text
        ? [{ text: (data as any).text, imageUrl: (data as any).imageUrl, mediaUrl: (data as any).mediaUrl }]
        : [];
  const first = rawList[0];
  if (!first) return;

  const text = interpolateVariables(
    adaptMessage(first, context.platform ?? "instagram").text,
    context.variables || {}
  );

  try {
    await zernio.comments.sendPrivateReplyToComment({
      path: {
        postId: String(context.variables!.post_id),
        commentId: String(context.variables!.comment_id),
      },
      body: { accountId: lateAccountId, message: text },
    });

    await supabase.from("messages").insert({
      conversation_id: context.conversationId,
      direction: "outbound",
      text,
      sent_by_flow_id: context.flowId,
      status: "sent",
    });

    await supabase.from("analytics_events").insert({
      workspace_id: context.workspaceId,
      flow_id: context.flowId,
      contact_id: context.contactId,
      event_type: "message_sent",
    });
  } catch (error) {
    console.error("Failed to send comment-context message as private reply:", error);
    await supabase.from("messages").insert({
      conversation_id: context.conversationId,
      direction: "outbound",
      text,
      sent_by_flow_id: context.flowId,
      status: "failed",
    });
    return;
  }

  if (rawList.length > 1) {
    console.warn(
      "Comment flow Send Message node had multiple messages; only the first was sent (one private reply per comment)."
    );
  }
}

export async function executeSendMessage(
  supabase: SupabaseClient<Database>,
  data: SendMessageNodeData,
  context: FlowExecutionContext
) {
  // Get workspace for API key
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted")
    .eq("id", context.workspaceId)
    .single();

  const apiKey = workspace?.late_api_key_encrypted || process.env.ZERNIO_API_KEY;
  if (!apiKey) return;

  const zernio = createZernioClient(apiKey);

  // Resolve account ID from channel if not in context
  let lateAccountId = context.lateAccountId;
  if (!lateAccountId) {
    const { data: channel } = await supabase
      .from("channels")
      .select("late_account_id, zernio_account_id, platform")
      .eq("id", context.channelId)
      .single();

    if (!channel) return;
    lateAccountId = channel.zernio_account_id || channel.late_account_id;
    if (!context.platform) {
      context.platform = channel.platform as FlowExecutionContext["platform"];
    }
  }

  const messageList =
    Array.isArray(data.messages) && data.messages.length > 0
      ? data.messages
      : (data as any).text
        ? [
            {
              text: (data as any).text,
              buttons: (data as any).buttons,
              quickReplies: (data as any).quickReplies,
              imageUrl: (data as any).imageUrl,
              mediaUrl: (data as any).mediaUrl,
            },
          ]
        : [];

  if (messageList.length === 0) return;

  // Resolve late_conversation_id from conversation if not in context
  let lateConversationId = context.lateConversationId;
  if (!lateConversationId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("late_conversation_id")
      .eq("id", context.conversationId)
      .single();

    if (conversation?.late_conversation_id) {
      lateConversationId = conversation.late_conversation_id;
    } else if (context.variables?.comment_id && context.variables?.post_id && lateAccountId) {
      await sendFirstMessageAsPrivateReply(supabase, zernio, data, context, lateAccountId);
      return;
    } else if (lateAccountId) {
      // Try resolving via participant from contact
      const { data: contact } = await supabase
        .from("contacts")
        .select("metadata")
        .eq("id", context.contactId)
        .single();
      const meta = contact?.metadata as any;
      const participantId = meta?.participantId || meta?.senderId || meta?.id;

      if (participantId) {
        try {
          const newConvRes = await zernio.messages.createInboxConversation({
            body: {
              accountId: lateAccountId,
              participantId,
              message: messageList[0]?.text || "Hello",
            } as any,
          });
          const createdConv = (newConvRes as any)?.data?.data || (newConvRes as any)?.data;
          lateConversationId = createdConv?.id || createdConv?._id;
          if (lateConversationId && context.conversationId) {
            await supabase
              .from("conversations")
              .update({ late_conversation_id: lateConversationId })
              .eq("id", context.conversationId);
          }
        } catch (convErr) {
          console.warn("[flow-engine] createInboxConversation fallback error:", convErr);
        }
      }
    }

    if (!lateConversationId) {
      console.error("No late_conversation_id found for conversation:", context.conversationId);
      return;
    }
  }

  for (const msg of messageList) {
    const adapted = adaptMessage(msg, context.platform!);
    const text = interpolateVariables(adapted.text, context.variables || {});

    try {
      const rawMsg = msg as { mediaUrl?: string; mediaType?: string; imageUrl?: string };
      const mediaUrl = rawMsg.mediaUrl || rawMsg.imageUrl;
      const mediaType = rawMsg.mediaType || (rawMsg.imageUrl ? "image" : undefined);

      const attachments = mediaUrl
        ? [{ type: mediaType || "image", url: mediaUrl }]
        : undefined;

      const body: Record<string, unknown> = {
        accountId: lateAccountId,
        message: text,
      };
      if (mediaUrl) {
        body.attachmentUrl = mediaUrl;
        body.attachmentType = mediaType || "image";
      }

      if (adapted.buttons?.length) {
        body.buttons = adapted.buttons;
      }
      if (adapted.quickReplies?.length) {
        body.quickReplies = adapted.quickReplies;
      }
      if (adapted.template) {
        body.template = adapted.template;
      }
      if (adapted.replyMarkup) {
        body.replyMarkup = adapted.replyMarkup;
      }

      const response = await zernio.messages.sendInboxMessage({
        path: { conversationId: lateConversationId },
        body: body as Parameters<typeof zernio.messages.sendInboxMessage>[0]["body"],
      });

      await supabase.from("messages").insert({
        conversation_id: context.conversationId,
        direction: "outbound",
        text,
        attachments: attachments || null,
        sent_by_flow_id: context.flowId,
        sent_by_node_id: null,
        platform_message_id: response.data?.data?.messageId || null,
        status: "sent",
      });

      await supabase.from("analytics_events").insert({
        workspace_id: context.workspaceId,
        flow_id: context.flowId,
        contact_id: context.contactId,
        event_type: "message_sent",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      await supabase.from("messages").insert({
        conversation_id: context.conversationId,
        direction: "outbound",
        text,
        sent_by_flow_id: context.flowId,
        status: "failed",
      });

      await supabase.from("analytics_events").insert({
        workspace_id: context.workspaceId,
        flow_id: context.flowId,
        contact_id: context.contactId,
        event_type: "message_failed",
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      });
    }

    if (messageList.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
