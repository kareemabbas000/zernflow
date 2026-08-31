import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { executeFlow, resumeSession } from "@/lib/flow-engine/engine";
import { matchTrigger } from "@/lib/flow-engine/trigger-matcher";

export const maxDuration = 30;
import { resolveWebhookSecret, verifyWebhookSignature } from "@/lib/zernio-webhook";
import { upsertContactForSender } from "@/lib/inbox-sync";
import { processComment } from "@/lib/comment-processor";
import type { Database } from "@/lib/types/database";
import { messagePreview } from "@/lib/message-preview";
import { isSupportedPlatform, normalizePlatform, type Platform } from "@/lib/platforms";

// ── Zernio API webhook payload ───────────────────────────────────────────────

interface WebhookPayload {
  id?: string;
  event: string;
  message: {
    id: string;
    conversationId: string;
    platform: string;
    platformMessageId: string;
    direction: string;
    text: string | null;
    attachments: Array<{ type: string; url: string; payload?: string }>;
    sender: {
      id: string;
      name: string;
      username: string | null;
      picture: string | null;
    };
    sentAt: string;
    isRead: boolean;
  };
  conversation: {
    id: string;
    platformConversationId: string | null;
    participantId: string;
    participantName: string;
    participantUsername: string | null;
    participantPicture: string | null;
    status: string;
  };
  account: {
    id: string;
    platform: string;
    username: string;
    displayName: string;
  };
  metadata?: {
    quickReplyPayload?: string;
    callbackData?: string;
    postbackPayload?: string;
    postbackTitle?: string;
  };
  timestamp: string;
}

interface CommentWebhookPayload {
  id?: string;
  event: string;
  comment: {
    id: string;
    /** Zernio post ID; null when the comment is on a post not published through Zernio. */
    postId: string | null;
    platformPostId: string;
    platform: string;
    text: string;
    author: { id: string; username?: string; name?: string; picture?: string };
    createdAt: string;
    isReply: boolean;
    parentCommentId: string | null;
  };
  post: { id: string; platformPostId: string };
  account: { id: string; platform: string; username: string };
  timestamp: string;
}

// ── Webhook handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    return await handleWebhook(request);
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Claim an event id for processing. Returns false when another delivery of the
 * same event already claimed it (Zernio retries with the same id), so retries
 * and redeliveries never re-run a flow. Events without an id are processed
 * unconditionally rather than dropped.
 */
async function claimWebhookEvent(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  eventId: string | null | undefined
): Promise<boolean> {
  if (!eventId) return true;
  const { error } = await supabase
    .from("webhook_events")
    .insert({ event_id: eventId });
  if (!error) return true;
  if (error.code === "23505") return false;
  // Table missing / transient DB error: fail open so deliveries keep working.
  console.error("webhook_events claim failed:", error);
  return true;
}

async function handleWebhook(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-late-signature");
  const headerEventId = request.headers.get("x-late-event-id");

  let parsed: { event?: string; id?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = parsed.id || headerEventId;

  if (parsed.event === "comment.received") {
    return handleCommentWebhook(parsed as CommentWebhookPayload, body, signature, eventId);
  }

  // Everything else besides message.received is acknowledged and ignored
  if (parsed.event !== "message.received") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const payload = parsed as WebhookPayload;

  const { message: msg, account } = payload;

  // Ignore outbound messages (sent by the bot or page itself) to prevent loops
  if (msg.direction === "outbound" || msg.direction === "outgoing") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = await createServiceClient();

  // Look up channel by late_account_id or zernio_account_id matching any account identifier
  const normPlatform = normalizePlatform(msg.platform || account.platform);
  const accountId = account.id || (account as any).accountId || (account as any)._id;

  let channelQuery = supabase
    .from("channels")
    .select("*")
    .or(`late_account_id.eq.${accountId},zernio_account_id.eq.${accountId}`)
    .eq("is_active", true);

  if (normPlatform) {
    channelQuery = channelQuery.eq("platform", normPlatform);
  }

  const { data: matchedChannels } = await channelQuery;
  const channel = matchedChannels?.[0];

  const activeChannel =
    channel ||
    (await supabase
      .from("channels")
      .select("*")
      .or(`late_account_id.eq.${accountId},zernio_account_id.eq.${accountId}`)
      .eq("is_active", true)
      .limit(1)
      .then((r) => r.data?.[0]));

  if (!activeChannel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // Prevent loops: if the sender is another connected account in this
  // workspace, skip. This happens when both sides of a DM conversation
  // are connected (e.g. during testing).
  if (msg.sender.username) {
    const { data: senderChannel } = await supabase
      .from("channels")
      .select("id")
      .eq("workspace_id", activeChannel.workspace_id)
      .eq("username", msg.sender.username)
      .eq("is_active", true)
      .maybeSingle();

    if (senderChannel) {
      return NextResponse.json({ ok: true, skipped: true, reason: "sender_is_own_account" });
    }
  }

  // Verify HMAC-SHA256 signature against the workspace-level secret
  // (falls back to the legacy per-channel secret during transition).
  const secret = await resolveWebhookSecret(supabase, activeChannel);
  if (secret && !verifyWebhookSignature(secret, body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!(await claimWebhookEvent(supabase, eventId))) {
    return NextResponse.json({ ok: true, skipped: true, reason: "duplicate_event" });
  }

  // Ack immediately and process after the response: Zernio aborts deliveries
  // at 5s and retries, so contact upserts + flow execution (Zernio sends, AI
  // nodes) must never run before the 200 goes out.
  after(async () => {
    try {
      await processMessageEvent(supabase, payload, activeChannel);
    } catch (err) {
      console.error("Webhook message processing error:", err);
    }
  });

  return NextResponse.json({ ok: true, queued: true });
}

async function processMessageEvent(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  payload: WebhookPayload,
  channel: Database["public"]["Tables"]["channels"]["Row"],
) {
  const { message: msg, conversation: conv, account, metadata } = payload;
  const accountId = account.id || (account as any).accountId || (account as any)._id || channel.zernio_account_id || channel.late_account_id;

  // ── Upsert contact ───────────────────────────────────────────────────────

  const senderId = msg.sender.id;
  const senderName = msg.sender.name || msg.sender.username || senderId;

  const contact = await upsertContactForSender({
    supabase,
    channel,
    senderId,
    senderName,
    senderPicture: msg.sender.picture || null,
    senderUsername: msg.sender.username || null,
    interactionAt: new Date().toISOString(),
  });

  if (!contact) {
    console.error("Failed to create contact for webhook message");
    return;
  }

  const contactId = contact.contactId;

  // ── Upsert conversation with clean single unread increment ───────────────

  const preview = messagePreview(msg.text);

  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id, unread_count, is_automation_paused")
    .eq("channel_id", channel.id)
    .eq("contact_id", contactId)
    .maybeSingle();

  let conversationId = existingConv?.id;
  let isAutomationPaused = existingConv?.is_automation_paused || false;

  if (existingConv) {
    // Existing conversation: increment unread by 1 cleanly
    const newUnread = (existingConv.unread_count || 0) + 1;
    // Fire and forget
    supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        unread_count: newUnread,
        status: "open",
        late_conversation_id: conv?.id || undefined,
      })
      .eq("id", existingConv.id)
      .then(({ error }) => {
        if (error) console.error("Failed to update conversation:", error);
      });
  } else {
    // Brand new conversation starts with 1 unread message
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        workspace_id: channel.workspace_id,
        channel_id: channel.id,
        contact_id: contactId,
        platform: channel.platform,
        late_conversation_id: conv?.id || null,
        status: "open",
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        unread_count: 1,
      })
      .select("id, is_automation_paused")
      .single();

    if (newConv) {
      conversationId = newConv.id;
      isAutomationPaused = newConv.is_automation_paused || false;
    }
  }

  if (!conversationId) {
    console.error("Failed to resolve conversation for webhook message");
    return;
  }

  // Messages are stored by Zernio (source of truth) — no local insert needed.

  // ── Flow engine ───────────────────────────────────────────────────────────

  if (!isAutomationPaused) {
    const incomingMessage = {
      text: msg.text || undefined,
      postbackPayload: metadata?.postbackPayload || undefined,
      quickReplyPayload: metadata?.quickReplyPayload || undefined,
      callbackData: metadata?.callbackData || undefined,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name,
        username: msg.sender.username || undefined,
      },
    };

    const handled = await handleGlobalKeywords(
      supabase,
      channel.workspace_id,
      contactId,
      msg.text || undefined
    );

    if (!handled) {
      // 1. Check if contact has an active flow session waiting for input
      const { data: waitingSession } = await supabase
        .from("flow_sessions")
        .select("*")
        .eq("contact_id", contactId)
        .eq("status", "active")
        .eq("waiting_for_input", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (waitingSession) {
        try {
          await resumeSession(supabase, waitingSession, {
            flowId: waitingSession.flow_id,
            channelId: channel.id,
            contactId,
            conversationId,
            workspaceId: channel.workspace_id,
            incomingMessage,
            lateConversationId: conv?.id || msg.conversationId,
            lateAccountId: accountId,
          });
          return;
        } catch (resumeErr) {
          console.error("[late-webhook] resumeSession error:", resumeErr);
        }
      }

      // 2. Check for trigger matches to start a new flow
      const trigger = await matchTrigger(supabase, {
        channelId: channel.id,
        workspaceId: channel.workspace_id,
        conversationId,
        message: incomingMessage,
        isFirstMessage: !contact.existed,
      });

      if (trigger) {
        // Clear previous stale active sessions for this contact
        // Fire and forget
        supabase
          .from("flow_sessions")
          .update({ status: "cancelled" })
          .eq("contact_id", contactId)
          .eq("status", "active")
          .then(({ error }) => {
            if (error) console.error("Failed to cancel stale sessions:", error);
          });

        try {
          await executeFlow(supabase, {
            triggerId: trigger.id,
            flowId: trigger.flow_id,
            channelId: channel.id,
            contactId,
            conversationId,
            workspaceId: channel.workspace_id,
            incomingMessage,
            lateConversationId: conv?.id || msg.conversationId,
            lateAccountId: accountId,
          });
        } catch (err) {
          console.error("Flow execution error:", err);
        }
      }
    }
  }
}

// ── Comment webhook ─────────────────────────────────────────────────────────

async function handleCommentWebhook(
  payload: CommentWebhookPayload,
  rawBody: string,
  signature: string | null,
  eventId: string | null | undefined
) {
  const supabase = await createServiceClient();

  const commentPlatform = payload.comment.platform || payload.account.platform;
  let commentQuery = supabase
    .from("channels")
    .select("*")
    .eq("late_account_id", payload.account.id)
    .eq("is_active", true);

  if (commentPlatform && isSupportedPlatform(commentPlatform)) {
    commentQuery = commentQuery.eq("platform", commentPlatform as Platform);
  }

  const { data: matchedCommentChannels } = await commentQuery;
  const channel =
    matchedCommentChannels?.[0] ||
    (await supabase
      .from("channels")
      .select("*")
      .eq("late_account_id", payload.account.id)
      .eq("is_active", true)
      .limit(1)
      .then((r) => r.data?.[0]));

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // Prevent loops: our own comments (e.g. the configured public reply) also
  // arrive as comment.received and must never re-trigger a flow.
  if (
    payload.comment.author?.username &&
    payload.comment.author.username === channel.username
  ) {
    return NextResponse.json({ ok: true, skipped: true, reason: "own_comment" });
  }

  const secret = await resolveWebhookSecret(supabase, channel);
  if (secret && !verifyWebhookSignature(secret, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!(await claimWebhookEvent(supabase, eventId))) {
    return NextResponse.json({ ok: true, skipped: true, reason: "duplicate_event" });
  }

  // Ack before processing (same 5s delivery budget as messages); processComment
  // additionally dedupes on (channel_id, platform_comment_id) so cross-event
  // redeliveries of the same comment stay one-shot.
  after(async () => {
    try {
      await processComment({
        supabase,
        channel,
        comment: {
          id: payload.comment.id,
          // Native posts (not published through Zernio) have a null postId; fall
          // back to the platform post id so flows still run. Zernio's private-reply
          // endpoint only needs the comment id, so the placeholder is harmless.
          postId: payload.comment.postId || payload.comment.platformPostId,
          text: payload.comment.text,
          author: payload.comment.author,
        },
      });
    } catch (err) {
      console.error("Webhook comment processing error:", err);
    }
  });

  return NextResponse.json({ ok: true, queued: true });
}

// ── Global keywords ─────────────────────────────────────────────────────────

async function handleGlobalKeywords(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  workspaceId: string,
  contactId: string,
  text: string | undefined
): Promise<boolean> {
  if (!text) return false;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("global_keywords")
    .eq("id", workspaceId)
    .single();

  if (!workspace?.global_keywords) return false;

  const keywords = workspace.global_keywords as Array<{
    keyword: string;
    action?: string;
    flowId?: string;
  }>;

  const normalizedText = text.toLowerCase().trim();

  for (const kw of keywords) {
    if (normalizedText === kw.keyword.toLowerCase()) {
      if (kw.action === "unsubscribe") {
        await supabase
          .from("contacts")
          .update({ is_subscribed: false })
          .eq("id", contactId);
        return true;
      }
      if (kw.action === "subscribe") {
        await supabase
          .from("contacts")
          .update({ is_subscribed: true })
          .eq("id", contactId);
        return true;
      }
      return false;
    }
  }

  return false;
}
