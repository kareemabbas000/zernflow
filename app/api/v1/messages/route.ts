import { logger } from "@/lib/logger";
import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZernioClient } from "@/lib/zernio-client";
import { messagePreview } from "@/lib/message-preview";
import { deleteAttachment } from "@/lib/storage";

/**
 * GET /api/v1/messages?conversationId=...
 *
 * Fetches messages from the Zernio API for a conversation belonging to the user's workspace.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  // Look up the conversation and ensure user is a workspace member
  const { data: conversation } = await supabase
    .from("conversations")
    .select("late_conversation_id, workspace_id, channels(late_account_id, zernio_account_id)")
    .eq("id", conversationId)
    .single();

  if (!conversation?.late_conversation_id) {
    return NextResponse.json({ error: "Conversation not found or missing external ID" }, { status: 404 });
  }

  // Tenant isolation check
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", conversation.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted")
    .eq("id", conversation.workspace_id)
    .single();

  const channel = conversation.channels as { late_account_id?: string; zernio_account_id?: string } | null;
  const accountId = channel?.zernio_account_id || channel?.late_account_id;
  if (!accountId) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // Fetch messages from Zernio API
  try {
    const zernio = createZernioClient(workspace?.late_api_key_encrypted);
    const res = await zernio.messages.getInboxConversationMessages({
      path: { conversationId: conversation.late_conversation_id },
      query: { accountId },
    });

    const zernioMessages =
      (res.data as { messages?: unknown[] })?.messages ??
      (res.data as { data?: unknown[] })?.data ??
      [];

    // Fetch local message metadata (to retain bot badges / sent_by_flow_id)
    const { data: localMessages } = await supabase
      .from("messages")
      .select("id, platform_message_id, sent_by_flow_id, direction, text, created_at")
      .eq("conversation_id", conversationId);

    const localMsgByTextTime = new Map<string, any>();
    for (const lm of localMessages || []) {
      if (lm.platform_message_id) {
        localMsgByTextTime.set(lm.platform_message_id, lm);
      }
      if (lm.text) {
        localMsgByTextTime.set(lm.text, lm);
      }
    }

    const messages = zernioMessages.map((m: any) => {
      // In Zernio SDK: direction is 'incoming' | 'outgoing'
      const isOutbound =
        m.direction === "outgoing" ||
        m.direction === "outbound" ||
        m.isFromAccount === true ||
        m.fromAccount === true;

      const rawText = m.message ?? m.text ?? null;
      const matchedLocal = (m.id && localMsgByTextTime.get(m.id)) ||
        (m.platformMessageId && localMsgByTextTime.get(m.platformMessageId)) ||
        (rawText && localMsgByTextTime.get(rawText));

      return {
        id: m.id || m._id || `msg-${Date.now()}`,
        conversation_id: conversationId,
        direction: isOutbound ? "outbound" : "inbound",
        text: rawText,
        attachments: m.attachments?.length ? m.attachments : null,
        quick_reply_payload: null,
        postback_payload: null,
        callback_data: null,
        platform_message_id: m.platformMessageId ?? m.id ?? null,
        sent_by_flow_id: matchedLocal?.sent_by_flow_id ?? null,
        sent_by_node_id: null,
        sent_by_user_id: null,
        status: isOutbound ? (m.status ?? "delivered") : "delivered",
        created_at: m.createdAt ?? m.sentAt ?? new Date().toISOString(),
      };
    });

    return NextResponse.json(messages);
  } catch (error) {
    logger.error("Failed to fetch messages from Zernio API:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/messages
 *
 * Sends a message via Zernio API. Tenant-isolated to the user's workspace.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { conversationId, text, isInternal, attachments } = body;

  if (!conversationId || (!text && (!attachments || attachments.length === 0))) {
    return NextResponse.json(
      { error: "conversationId and text or attachments required" },
      { status: 400 }
    );
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, channels(*)")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Tenant isolation check
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", conversation.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
  }

  if (!conversation.late_conversation_id) {
    return NextResponse.json(
      { error: "No external conversation ID linked to this conversation" },
      { status: 400 }
    );
  }

  const channel = conversation.channels as { late_account_id?: string; zernio_account_id?: string } | null;
  const accountId = channel?.zernio_account_id || channel?.late_account_id;
  if (!accountId) {
    return NextResponse.json({ error: "Channel account ID missing" }, { status: 404 });
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted")
    .eq("id", conversation.workspace_id)
    .single();

  // If this is an internal note, skip Zernio and insert directly
  if (isInternal) {
    try {
      const newMessage: any = {
        conversation_id: conversationId,
        direction: "outbound",
        text,
        attachments: attachments || null,
        sent_by_user_id: user.id,
        status: "sent",
        is_internal: true,
      };
      
      const { data: insertedMsg, error: insertError } = await (supabase as any)
        .from("messages")
        .insert(newMessage)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // Update conversation's last message info
      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: `[Internal Note] ${messagePreview(text)}`,
        })
        .eq("id", conversationId);
        
      return NextResponse.json(insertedMsg, { status: 201 });
    } catch (error) {
      logger.error("Failed to save internal note:", error);
      return NextResponse.json({ error: "Failed to save internal note" }, { status: 500 });
    }
  }

  // Send via Zernio SDK for external messages
  try {
    const zernio = createZernioClient(workspace?.late_api_key_encrypted);
    const zernioAttachments = attachments ? attachments.map(({ path, ...rest }: any) => rest) : undefined;
    const res = await zernio.messages.sendInboxMessage({
      path: { conversationId: conversation.late_conversation_id },
      body: { accountId, message: text, attachments: zernioAttachments },
    });

    const messageId = (res.data as any)?.data?.messageId ?? (res.data as any)?.messageId ?? null;

    // Update conversation's last message info
    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: messagePreview(text),
      })
      .eq("id", conversationId);

    return NextResponse.json(
      {
        id: messageId ?? `sent-${Date.now()}`,
        conversation_id: conversationId,
        direction: "outbound",
        text,
        attachments: attachments || null,
        quick_reply_payload: null,
        postback_payload: null,
        callback_data: null,
        platform_message_id: messageId,
        sent_by_flow_id: null,
        sent_by_node_id: null,
        sent_by_user_id: user.id,
        status: "sent",
        is_internal: false,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to send message via Zernio API:", error);
    return NextResponse.json(
      { error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  } finally {
    // Fire-and-forget deletion of temporary media bridge files after 60 seconds
    if (attachments && attachments.length > 0) {
      after(async () => {
        // Give WhatsApp/Telegram enough time to download from the public URL
        await new Promise((resolve) => setTimeout(resolve, 60000));
        
        for (const att of attachments) {
          if (att.path) {
            try {
              await deleteAttachment(att.path);
              logger.info(`Deleted temporary attachment: ${att.path}`);
            } catch (err) {
              logger.error(`Failed to delete temporary attachment ${att.path}:`, err);
            }
          }
        }
      });
    }
  }
}
