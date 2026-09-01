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
    .select("id, contact_id, channel_id, late_conversation_id, workspace_id, last_message_preview, channels(late_account_id, zernio_account_id), contacts(id, metadata)")
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

  // Fetch local messages from Supabase first
  const { data: localMessages } = await supabase
    .from("messages")
    .select("id, conversation_id, platform_message_id, sent_by_flow_id, sent_by_node_id, sent_by_user_id, direction, text, attachments, quick_reply_payload, postback_payload, callback_data, status, delivery_status, is_internal, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const channel = conversation.channels as { late_account_id?: string; zernio_account_id?: string } | null;
  const accountId = channel?.zernio_account_id || channel?.late_account_id;

  const { data: contactChannel } = await supabase
    .from("contact_channels")
    .select("platform_sender_id")
    .eq("contact_id", conversation.contact_id)
    .eq("channel_id", conversation.channel_id)
    .maybeSingle();

  const candidateIds = Array.from(
    new Set(
      [
        contactChannel?.platform_sender_id,
        conversation.late_conversation_id,
        (conversation.contacts?.metadata as any)?.sender_id,
      ].filter(Boolean) as string[]
    )
  );

  // If there are no candidate IDs or account ID, return local messages directly
  if (candidateIds.length === 0 || !accountId) {
    return NextResponse.json(localMessages || []);
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("late_api_key_encrypted")
    .eq("id", conversation.workspace_id)
    .single();

  // Fetch messages from Zernio API across candidate IDs and merge with local
  try {
    const zernio = createZernioClient(workspace?.late_api_key_encrypted);
    let zernioMessages: any[] = [];
    let successfulConvId: string | null = null;

    for (const cId of candidateIds) {
      try {
        const res = await zernio.messages.getInboxConversationMessages({
          path: { conversationId: cId },
          query: { accountId },
        });

        const msgs =
          (res.data as { messages?: unknown[] })?.messages ??
          (res.data as { data?: unknown[] })?.data ??
          [];

        if (msgs.length > 0) {
          zernioMessages = msgs;
          successfulConvId = cId;
          break;
        }
      } catch (e) {
        // Continue trying next candidate ID
      }
    }

    // If a working candidate ID was found and differs from saved, sync it to the DB
    if (successfulConvId && successfulConvId !== conversation.late_conversation_id) {
      supabase
        .from("conversations")
        .update({ late_conversation_id: successfulConvId })
        .eq("id", conversation.id)
        .then();
    }

    const localMsgByTextTime = new Map<string, any>();
    for (const lm of localMessages || []) {
      if (lm.platform_message_id) {
        localMsgByTextTime.set(lm.platform_message_id, lm);
      }
      if (lm.text) {
        localMsgByTextTime.set(lm.text, lm);
      }
    }

    const matchedLocalIds = new Set<string>();

    const messages = zernioMessages.map((m: any) => {
      // In Zernio SDK: direction is 'incoming' | 'outgoing'
      const isOutbound =
        m.direction === "outgoing" ||
        m.direction === "outbound" ||
        m.isFromAccount === true ||
        m.fromAccount === true;

      let rawText = m.message ?? m.text ?? null;
      if (typeof rawText === "object" && rawText !== null) {
        rawText = rawText.text || JSON.stringify(rawText);
      }
      if (typeof rawText !== "string" && rawText !== null) {
        rawText = String(rawText);
      }

      const matchedLocal = (m.id && localMsgByTextTime.get(m.id)) ||
        (m.platformMessageId && localMsgByTextTime.get(m.platformMessageId)) ||
        (rawText && localMsgByTextTime.get(rawText));

      if (matchedLocal) {
        matchedLocalIds.add(matchedLocal.id);
      }

      return {
        id: m.id || m._id || `msg-${Date.now()}`,
        conversation_id: conversationId,
        direction: isOutbound ? "outbound" : "inbound",
        text: rawText,
        attachments: Array.isArray(m.attachments) ? m.attachments.filter(Boolean) : (m.attachments ? [m.attachments] : null),
        quick_reply_payload: null as string | null,
        postback_payload: null as string | null,
        callback_data: null as string | null,
        platform_message_id: m.platformMessageId ?? m.id ?? null,
        sent_by_flow_id: matchedLocal?.sent_by_flow_id ?? null,
        sent_by_node_id: null as string | null,
        sent_by_user_id: null as string | null,
        status: isOutbound ? (m.status ?? "delivered") : "delivered",
        delivery_status: isOutbound ? (matchedLocal?.delivery_status ?? "sent") : "read",
        is_internal: false,
        created_at: m.createdAt ?? m.sentAt ?? new Date().toISOString(),
        isStoryMention: Boolean(
          m.isStoryMention ||
          m.attachments?.some((a: any) => a.isStoryMention || (a.type || "").includes("story_mention"))
        ),
        isStoryReply: Boolean(
          m.isStoryReply ||
          m.attachments?.some((a: any) => (a.type || "").includes("story_reply"))
        ),
        storyUrl: m.storyUrl || null,
        referral: m.referral || null,
      };
    });

    // Append any unmatched local messages (e.g. AI bot responses that haven't synced yet, or internal notes)
    if (localMessages) {
      for (const lm of localMessages) {
        if (!matchedLocalIds.has(lm.id)) {
          messages.push({
            ...lm,
            isStoryMention: false,
            isStoryReply: false,
            storyUrl: null,
            referral: null,
          });
        }
      }
    }
    
    // Sort combined messages by created_at ascending
    messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Auto-update conversation preview in DB if empty
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const preview = messagePreview(lastMsg.text, lastMsg.attachments, {
        isStoryMention: (lastMsg as any).isStoryMention,
        isStoryReply: (lastMsg as any).isStoryReply,
      });

      if (preview && (!conversation.last_message_preview || conversation.last_message_preview !== preview)) {
        supabase
          .from("conversations")
          .update({
            last_message_preview: preview,
            last_message_at: lastMsg.created_at,
          })
          .eq("id", conversation.id)
          .then();
      }
    }

    return NextResponse.json(messages);
  } catch (error) {
    logger.error("Failed to fetch messages from Zernio API, falling back to local messages:", error);
    return NextResponse.json(localMessages || []);
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
    const firstAttachment = attachments?.[0];
    const res = await zernio.messages.sendInboxMessage({
      path: { conversationId: conversation.late_conversation_id },
      body: { 
        accountId, 
        message: text || undefined, 
        ...(firstAttachment && {
          attachmentUrl: firstAttachment.url,
          attachmentType: firstAttachment.type,
          attachmentName: firstAttachment.name,
          ...(firstAttachment.isVoiceNote && { voiceNote: true })
        })
      },
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

    // Insert the outbound message locally so delivery webhooks and Realtime can track it
    const localMessageId = `msg-${Date.now()}`;
    await supabase.from("messages").insert({
      id: localMessageId,
      conversation_id: conversationId,
      direction: "outbound",
      text: text || null,
      attachments: attachments || null,
      platform_message_id: messageId,
      sent_by_user_id: user.id,
      status: "sent",
      delivery_status: "sent",
      is_internal: false,
    });

    return NextResponse.json(
      {
        id: localMessageId,
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
        delivery_status: "sent",
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
