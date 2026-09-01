import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FlowExecutionContext, AiResponseNodeData } from "../types";
import { createZernioClient } from "@/lib/zernio-client";
import { generateText, createGateway, tool } from "ai";
import { z } from "zod";
import { interpolateVariables } from "../utils";

// Halt the run: continuing would let a downstream Send Message deliver the
// literal "{{ai_response}}" token to the contact (same pause mechanism as
// humanTakeover, but the session is cancelled rather than completed).
async function cancelRun(
  supabase: SupabaseClient<Database>,
  sessionId: string
): Promise<"pause"> {
  await supabase
    .from("flow_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId);
  return "pause";
}

export async function executeAiResponse(
  supabase: SupabaseClient<Database>,
  data: AiResponseNodeData,
  context: FlowExecutionContext,
  sessionId: string
) {
  // Get workspace for Zernio API key + AI Gateway key
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted, ai_api_key")
    .eq("id", context.workspaceId)
    .single();

  const apiKey = workspace?.late_api_key_encrypted || process.env.ZERNIO_API_KEY;
  if (!apiKey) {
    console.error("No Zernio API key configured on platform or workspace:", context.workspaceId);
    return cancelRun(supabase, sessionId);
  }

  const zernio = createZernioClient(apiKey);

  // Resolve account ID from channel if not in context
  let lateAccountId = context.lateAccountId;
  if (!lateAccountId) {
    const { data: channel } = await supabase
      .from("channels")
      .select("late_account_id, zernio_account_id, platform")
      .eq("id", context.channelId)
      .single();

    if (!channel) {
      console.error("No channel found for id:", context.channelId);
      return cancelRun(supabase, sessionId);
    }
    lateAccountId = channel.zernio_account_id || channel.late_account_id;
    if (!context.platform) {
      context.platform = channel.platform as FlowExecutionContext["platform"];
    }
  }

  // Check if this is a comment context (lacks a late_conversation_id initially)
  const isCommentContext = Boolean(context.variables?.comment_id && context.variables?.post_id);

  // Resolve late_conversation_id from conversation if not in context
  let lateConversationId = context.lateConversationId;
  if (!lateConversationId && !isCommentContext) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("late_conversation_id")
      .eq("id", context.conversationId)
      .single();

    if (!conversation?.late_conversation_id) {
      console.error("No late_conversation_id found for conversation:", context.conversationId);
      return cancelRun(supabase, sessionId);
    }
    lateConversationId = conversation.late_conversation_id;
  }

  // Fetch last N messages from the conversation for context
  const contextMessages = data.contextMessages || 10;
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("direction, text")
    .eq("conversation_id", context.conversationId)
    .order("created_at", { ascending: false })
    .limit(contextMessages);

  // Build messages array for the AI
  const aiMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (recentMessages && recentMessages.length > 0) {
    // Reverse to get chronological order (oldest first)
    const chronological = [...recentMessages].reverse();
    for (const msg of chronological) {
      if (!msg.text) continue;
      aiMessages.push({
        role: msg.direction === "inbound" ? "user" : "assistant",
        content: msg.text,
      });
    }
  }

  // Ensure the current incoming message (or comment) is always included
  // as the latest user message, since inbound messages might not be in the DB yet.
  if (context.incomingMessage.text) {
    // Prevent duplication if somehow it was already the last message in DB
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== context.incomingMessage.text) {
      aiMessages.push({
        role: "user",
        content: context.incomingMessage.text,
      });
    }
  }

  try {
    const model = data.model || "openai/gpt-4o-mini";
    const aiGatewayKey = workspace?.ai_api_key || process.env.AI_GATEWAY_API_KEY;
    const gw = createGateway({ apiKey: aiGatewayKey || undefined });
    
    // Interpolate variables into the system prompt (e.g. {{comment_text}})
    let systemPrompt = interpolateVariables(
      data.systemPrompt || "You are a helpful customer support agent.",
      context.variables || {}
    );

    // Append Knowledge Base if provided
    if (data.knowledgeBase?.trim()) {
      systemPrompt += `\n\n--- BUSINESS KNOWLEDGE BASE / RULES ---\n${data.knowledgeBase.trim()}\n--- END KNOWLEDGE BASE ---`;
    }

    // Prepare Tools based on user selection
    const enabledTools = data.enabledTools || [];
    const activeTools: Record<string, any> = {};

    if (enabledTools.includes("get_current_time")) {
      activeTools.get_current_time = tool({
        description: "Get the current time and date to answer temporal questions.",
        parameters: z.object({
          timezone: z.string().optional().describe("Optional timezone"),
        }),
        execute: async ({ timezone }: { timezone?: string }) => ({ time: new Date().toISOString(), timezone }),
      } as any);
    }

    if (enabledTools.includes("check_order_status")) {
      activeTools.check_order_status = tool({
        description: "Check the status of an order using an order ID.",
        parameters: z.object({
          orderId: z.string().describe("The order ID provided by the user."),
        }),
        execute: async ({ orderId }: { orderId: string }) => {
          // Simulated logic for demonstration
          if (orderId.startsWith("1") || orderId.toLowerCase().includes("shp")) {
            return { orderId, status: "Shipped", estimatedDelivery: "2 days" };
          }
          return { orderId, status: "Processing", estimatedDelivery: "5 days" };
        },
      } as any);
    }

    if (enabledTools.includes("escalate_to_human")) {
      activeTools.escalate_to_human = tool({
        description: "Escalate the conversation to a human agent if the user is frustrated or asks to speak to a human.",
        parameters: z.object({
          reason: z.string().describe("Reason for the escalation."),
        }),
        execute: async ({ reason }: { reason: string }) => {
          // In a full implementation, this could update the conversation status or add a tag
          console.log(`[AI Tool] Escalate to human requested for conversation ${context.conversationId}: ${reason}`);
          return { status: "Escalated to human support queue successfully.", reason };
        },
      } as any);
    }

    const hasTools = Object.keys(activeTools).length > 0;

    const result = await generateText({
      model: gw(model),
      system: systemPrompt,
      messages: aiMessages,
      temperature: data.temperature ?? 0.7,
      maxOutputTokens: data.maxTokens ?? 500,
      ...(hasTools ? { tools: activeTools, maxSteps: 5 } : {}),
    });

    const text = result.text;

    // Expose the generated text to downstream nodes as {{ai_response}}
    context.variables = { ...(context.variables ?? {}), ai_response: text };

    await supabase.from("analytics_events").insert({
      workspace_id: context.workspaceId,
      event_type: "debug_ai_generated",
      metadata: { sendDirectly: data.sendDirectly, text }
    });

    if (data.sendDirectly !== false) {
      let messageId: string | null = null;
      
      if (isCommentContext) {
        // Send via Private Reply (Comment Context)
        await supabase.from("analytics_events").insert({ workspace_id: context.workspaceId, event_type: "debug_ai_sending_private" });
        await zernio.comments.sendPrivateReplyToComment({
          path: { 
            postId: context.variables!.post_id as string, 
            commentId: context.variables!.comment_id as string 
          },
          body: { accountId: lateAccountId, message: text },
        });
        await supabase.from("analytics_events").insert({ workspace_id: context.workspaceId, event_type: "debug_ai_sent_private" });
      } else {
        // Send via Zernio REST API (Standard DM Context)
        await supabase.from("analytics_events").insert({ workspace_id: context.workspaceId, event_type: "debug_ai_sending_inbox" });
        const response = await zernio.messages.sendInboxMessage({
          path: { conversationId: lateConversationId as string },
          body: { accountId: lateAccountId, message: text },
        });
        messageId = response.data?.data?.messageId || null;
        await supabase.from("analytics_events").insert({ workspace_id: context.workspaceId, event_type: "debug_ai_sent_inbox" });
      }

      // Store outbound message
      const msgInsert = await supabase.from("messages").insert({
        conversation_id: context.conversationId,
        direction: "outbound",
        text,
        attachments: null,
        sent_by_flow_id: context.flowId,
        sent_by_node_id: null,
        platform_message_id: messageId,
        status: "sent",
      });
      await supabase.from("analytics_events").insert({
        workspace_id: context.workspaceId,
        event_type: "debug_ai_msg_insert",
        metadata: { error: msgInsert.error?.message || null }
      });

      await supabase.from("analytics_events").insert({
        workspace_id: context.workspaceId,
        flow_id: context.flowId,
        contact_id: context.contactId,
        event_type: "message_sent",
      });
    } else {
      await supabase.from("analytics_events").insert({
        workspace_id: context.workspaceId,
        event_type: "debug_ai_skipped_sendDirectly_false"
      });
    }
  } catch (error) {
    console.error("Failed to generate or send AI response:", error);
    await supabase.from("analytics_events").insert({
      workspace_id: context.workspaceId,
      flow_id: context.flowId,
      contact_id: context.contactId,
      event_type: "debug_ai_catch",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" }
    });

    await supabase.from("messages").insert({
      conversation_id: context.conversationId,
      direction: "outbound",
      text: "[AI response failed]",
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

    return cancelRun(supabase, sessionId);
  }
}
