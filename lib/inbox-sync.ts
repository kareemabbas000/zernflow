/**
 * Inbox backfill from Zernio.
 *
 * The local `conversations` table is otherwise populated only by inbound
 * webhooks, so conversations that predate webhook registration never appear
 * in the Inbox (#12). This module pages through Zernio's inbox conversations
 * per channel and imports the ones missing locally.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Zernio } from "./zernio-client";
import { messagePreview } from "@/lib/message-preview";
import { matchTrigger } from "@/lib/flow-engine/trigger-matcher";
import { executeFlow } from "@/lib/flow-engine/engine";

/** Cap per channel: 4 pages x 50 conversations. */
const MAX_PAGES_PER_CHANNEL = 4;
const PAGE_SIZE = 50;

export interface BackfillChannel {
  id: string;
  late_account_id: string;
  platform: string;
}

/** Conversation item shape returned by Zernio's listInboxConversations. */
interface ZernioInboxConversation {
  id?: string;
  participantId?: string;
  participantName?: string;
  participantPicture?: string | null;
  lastMessage?: string;
  updatedTime?: string;
  status?: "active" | "archived";
  unreadCount?: number | null;
}

/**
 * Finds or creates the contact behind a platform sender: reuses the mapping in
 * `contact_channels` (channel_id, platform_sender_id); otherwise inserts the
 * contact, its channel mapping, and a `contact_created` analytics event.
 * Returns null when the contact insert fails; `existed` tells whether the
 * sender was already known on this channel.
 * With `stampExisting: false` an existing contact's last_interaction_at is
 * left untouched; the caller stamps it once the interaction is confirmed.
 */
export async function upsertContactForSender({
  supabase,
  channel,
  senderId,
  senderName,
  senderPicture,
  senderUsername,
  interactionAt,
  stampExisting = true,
}: {
  supabase: SupabaseClient;
  channel: { id: string; workspace_id: string };
  senderId: string;
  senderName: string;
  senderPicture: string | null;
  senderUsername?: string | null;
  interactionAt: string;
  stampExisting?: boolean;
}): Promise<{ contactId: string; existed: boolean } | null> {
  const { data: existingContactChannel } = await supabase
    .from("contact_channels")
    .select("contact_id")
    .eq("channel_id", channel.id)
    .eq("platform_sender_id", senderId)
    .single();

  if (existingContactChannel) {
    if (stampExisting) {
      await supabase
        .from("contacts")
        .update({ last_interaction_at: interactionAt })
        .eq("id", existingContactChannel.contact_id);
    }
    return { contactId: existingContactChannel.contact_id, existed: true };
  }

  const { data: newContact } = await supabase
    .from("contacts")
    .insert({
      workspace_id: channel.workspace_id,
      display_name: senderName,
      avatar_url: senderPicture,
      last_interaction_at: interactionAt,
    })
    .select("id")
    .single();

  if (!newContact) return null;

  await supabase.from("contact_channels").insert({
    contact_id: newContact.id,
    channel_id: channel.id,
    platform_sender_id: senderId,
    platform_username: senderUsername ?? null,
  });

  await supabase.from("analytics_events").insert({
    workspace_id: channel.workspace_id,
    contact_id: newContact.id,
    event_type: "contact_created",
  });

  return { contactId: newContact.id, existed: false };
}

/**
 * Imports Zernio inbox conversations missing from the local `conversations`
 * table. Insert-only: conversations already known (by late_conversation_id)
 * are skipped, and a contact whose (channel_id, contact_id) row already exists
 * under a different late_conversation_id is left to the webhook, so the
 * webhook-maintained late_conversation_id / status / last_message_at /
 * unread_count are never clobbered. A failing channel is logged and skipped,
 * not fatal.
 */
export async function backfillInboxConversations({
  supabase,
  zernio,
  workspaceId,
  channels,
}: {
  supabase: SupabaseClient;
  zernio: Zernio;
  workspaceId: string;
  channels: BackfillChannel[];
}): Promise<{ imported: number }> {
  let imported = 0;

  for (const channel of channels) {
    try {
      imported += await backfillChannel({ supabase, zernio, workspaceId, channel });
    } catch (err) {
      console.error(
        `[inbox-sync] backfill failed for channel ${channel.id} (${channel.platform}):`,
        err
      );
    }
  }

  return { imported };
}

async function backfillChannel({
  supabase,
  zernio,
  workspaceId,
  channel,
}: {
  supabase: SupabaseClient;
  zernio: Zernio;
  workspaceId: string;
  channel: BackfillChannel;
}): Promise<number> {
  const { data: existingRows } = await supabase
    .from("conversations")
    .select("late_conversation_id")
    .eq("channel_id", channel.id);

  const known = new Set(
    (existingRows ?? [])
      .map((r: { late_conversation_id: string | null }) => r.late_conversation_id)
      .filter(Boolean)
  );

  let imported = 0;
  let cursor: string | undefined;
  const seenParticipants = new Set<string>();

  for (let page = 0; page < MAX_PAGES_PER_CHANNEL; page++) {
    const res = await zernio.messages.listInboxConversations({
      query: {
        accountId: channel.late_account_id,
        limit: PAGE_SIZE,
        sortOrder: "desc",
        cursor,
      },
    });

    const conversations = (res.data?.data ?? []) as ZernioInboxConversation[];
    if (conversations.length === 0) break;

    for (const conv of conversations) {
      if (!conv.id || !conv.participantId) continue;
      if (seenParticipants.has(conv.participantId)) continue;
      seenParticipants.add(conv.participantId);

      const isNew = !known.has(conv.id);
      const success = await importConversation({ supabase, zernio, workspaceId, channel, conv });
      if (success && isNew) {
        imported++;
      }
    }

    const pagination = res.data?.pagination;
    if (!pagination?.hasMore || !pagination.nextCursor) break;
    cursor = pagination.nextCursor;
  }

  return imported;
}

async function importConversation({
  supabase,
  zernio,
  workspaceId,
  channel,
  conv,
}: {
  supabase: SupabaseClient;
  zernio: Zernio;
  workspaceId: string;
  channel: BackfillChannel;
  conv: ZernioInboxConversation;
}): Promise<boolean> {
  const interactionAt = conv.updatedTime ?? new Date().toISOString();
  const contact = await upsertContactForSender({
    supabase,
    channel: { id: channel.id, workspace_id: workspaceId },
    senderId: conv.participantId!,
    senderName: conv.participantName || conv.participantId!,
    senderPicture: conv.participantPicture || null,
    interactionAt,
    stampExisting: true,
  });

  if (!contact) {
    console.error(`[inbox-sync] failed to create contact for conversation ${conv.id}`);
    return false;
  }

  // 1. Check if conversation already exists and if anything changed
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id, last_message_at, last_message_preview, unread_count, status")
    .eq("channel_id", channel.id)
    .eq("contact_id", contact.contactId)
    .maybeSingle();

  const newPreview = messagePreview(conv.lastMessage);
  const targetStatus = conv.status === "archived" ? "closed" : "open";
  const newTimestamp = conv.updatedTime || existingConv?.last_message_at || interactionAt;

  const isNewer =
    Boolean(existingConv) &&
    Boolean(conv.updatedTime) &&
    Boolean(existingConv?.last_message_at) &&
    new Date(conv.updatedTime!).getTime() > new Date(existingConv!.last_message_at).getTime();

  let newUnread = 0;
  if (!existingConv) {
    newUnread = typeof conv.unreadCount === "number" ? conv.unreadCount : 0;
  } else {
    // For existing conversations, strictly preserve the database unread count.
    // Real-time increments are handled exclusively by incoming message webhooks.
    newUnread = existingConv.unread_count || 0;
  }

  // If conversation exists and hasn't changed, skip database write to prevent realtime loops
  if (
    existingConv &&
    existingConv.last_message_at === newTimestamp &&
    existingConv.last_message_preview === newPreview &&
    existingConv.unread_count === newUnread &&
    existingConv.status === targetStatus
  ) {
    return false;
  }

  const { data: convRow, error } = await supabase
    .from("conversations")
    .upsert(
      {
        workspace_id: workspaceId,
        channel_id: channel.id,
        contact_id: contact.contactId,
        platform: channel.platform,
        late_conversation_id: conv.id,
        status: targetStatus,
        last_message_at: newTimestamp,
        last_message_preview: newPreview,
        unread_count: newUnread,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "channel_id,contact_id" }
    )
    .select("id, unread_count, last_message_at")
    .single();

  if (error || !convRow) {
    console.error(`[inbox-sync] failed to upsert conversation ${conv.id}:`, error);
    return false;
  }

  // 2. Only store inbound messages when unread count > 0 to prevent outbound messages from being marked as inbound
  if (conv.lastMessage && convRow.id && newUnread > 0) {
    try {
      const msgId = `sync-${conv.id}-${conv.updatedTime || Date.now()}`;
      await supabase.from("messages").upsert(
        {
          conversation_id: convRow.id,
          platform_message_id: msgId,
          direction: "inbound",
          text: conv.lastMessage,
          status: "delivered",
          created_at: conv.updatedTime ?? new Date().toISOString(),
        },
        { onConflict: "conversation_id,platform_message_id" }
      );

      // 3. Autopilot: Trigger automated flows when a new inbound message arrives
      if (isNewer || !existingConv) {
        const incomingMessage = {
          text: conv.lastMessage,
          sender: {
            id: contact.contactId,
            name: conv.participantName || contact.contactId,
            username: (conv as any).participantUsername || (conv as any).username || undefined,
          },
        };

        const trigger = await matchTrigger(supabase as any, {
          channelId: channel.id,
          workspaceId,
          conversationId: convRow.id,
          message: incomingMessage,
          isFirstMessage: !existingConv,
        });

        if (trigger) {
          executeFlow(supabase as any, {
            triggerId: trigger.id,
            flowId: trigger.flow_id,
            channelId: channel.id,
            contactId: contact.contactId,
            conversationId: convRow.id,
            workspaceId,
            incomingMessage,
            lateConversationId: conv.id,
            lateAccountId: (channel as any).zernio_account_id || channel.late_account_id,
          }).catch((err) => {
            console.error("[inbox-sync] Autopilot flow execution error:", err);
          });
        }
      }
    } catch {
      // Non-fatal
    }
  }

  return true;
}
