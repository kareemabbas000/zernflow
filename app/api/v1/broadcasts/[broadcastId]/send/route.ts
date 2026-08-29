import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scheduleBroadcastDelivery } from "@/lib/scheduler";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Platform } from "@/lib/types/database";

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface SegmentGroup {
  combinator: "and" | "or";
  rules: SegmentRule[];
}

interface SegmentFilter {
  combinator: "and" | "or";
  groups: SegmentGroup[];
}

/**
 * POST /api/v1/broadcasts/:broadcastId/send
 *
 * Resolves the broadcast's segment filter into contacts,
 * creates broadcast_recipients, and schedules delivery jobs.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const { broadcastId } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  // Fetch the broadcast
  const { data: broadcast, error: broadcastErr } = await supabase
    .from("broadcasts")
    .select("*")
    .eq("id", broadcastId)
    .eq("workspace_id", membership.workspace_id)
    .single();

  if (broadcastErr || !broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  if (broadcast.status !== "draft" && broadcast.status !== "scheduled") {
    return NextResponse.json(
      { error: `Cannot send broadcast with status "${broadcast.status}"` },
      { status: 400 }
    );
  }

  // Allow overriding message content from the request body
  let messageContent = broadcast.message_content as { text?: string };
  try {
    const body = await request.json();
    if (body.messageContent) {
      messageContent = body.messageContent;
      // Update the broadcast with the message content
      await supabase
        .from("broadcasts")
        .update({ message_content: messageContent as unknown as Json })
        .eq("id", broadcastId);
    }
  } catch {
    // No body or invalid JSON, use existing message_content
  }

  if (!messageContent?.text?.trim()) {
    return NextResponse.json(
      { error: "Message content is required. Set message_content.text on the broadcast." },
      { status: 400 }
    );
  }

  // Resolve contacts from segment filter
  const filter = broadcast.segment_filter as unknown as SegmentFilter | null;
  const contactIds = await resolveContacts(
    supabase,
    membership.workspace_id,
    filter
  );

  if (contactIds.length === 0) {
    return NextResponse.json(
      { error: "No contacts match the segment filter" },
      { status: 400 }
    );
  }

  // For each contact, find their active channel link (via contact_channels or conversations)
  const { data: contactChannels } = await supabase
    .from("contact_channels")
    .select("contact_id, channel_id")
    .in("contact_id", contactIds);

  const { data: convChannels } = await supabase
    .from("conversations")
    .select("contact_id, channel_id")
    .in("contact_id", contactIds);

  const allChannelLinks: { contact_id: string; channel_id: string }[] = [
    ...(contactChannels || []),
    ...(convChannels || []),
  ];

  // If contacts have no explicit link yet, find any active channel in the workspace
  if (!allChannelLinks.length) {
    const { data: activeChannels } = await supabase
      .from("channels")
      .select("id")
      .eq("workspace_id", membership.workspace_id)
      .eq("is_active", true)
      .limit(1);

    if (activeChannels?.length) {
      for (const cid of contactIds) {
        allChannelLinks.push({ contact_id: cid, channel_id: activeChannels[0].id });
      }
    }
  }

  if (!allChannelLinks.length) {
    return NextResponse.json(
      { error: "No contacts have active channel connections" },
      { status: 400 }
    );
  }

  // Deduplicate: one recipient per contact (first channel found)
  const seen = new Set<string>();
  const recipientPairs: { contactId: string; channelId: string }[] = [];
  for (const cc of allChannelLinks) {
    if (!seen.has(cc.contact_id)) {
      seen.add(cc.contact_id);
      recipientPairs.push({
        contactId: cc.contact_id,
        channelId: cc.channel_id,
      });
    }
  }

  // Create broadcast_recipients
  const recipientRows = recipientPairs.map((r) => ({
    broadcast_id: broadcastId,
    contact_id: r.contactId,
    channel_id: r.channelId,
    status: "pending",
  }));

  // Insert in batches of 500
  const recipientIds: string[] = [];
  for (let i = 0; i < recipientRows.length; i += 500) {
    const batch = recipientRows.slice(i, i + 500);
    const { data: inserted, error: insertErr } = await supabase
      .from("broadcast_recipients")
      .insert(batch)
      .select("id");

    if (insertErr) {
      console.error("Failed to insert broadcast recipients:", insertErr);
      return NextResponse.json(
        { error: `Failed to create recipients: ${insertErr.message}` },
        { status: 500 }
      );
    }

    if (inserted) {
      recipientIds.push(...inserted.map((r) => r.id));
    }
  }

  if (recipientIds.length === 0) {
    return NextResponse.json(
      { error: "Failed to create broadcast recipients" },
      { status: 500 }
    );
  }

  // Schedule delivery in scheduled_jobs fallback
  await scheduleBroadcastDelivery(supabase, broadcastId, recipientIds);

  // Deliver broadcast directly
  deliverBroadcastDirectly(supabase, broadcastId, membership.workspace_id, messageContent.text);

  return NextResponse.json({
    broadcastId,
    totalRecipients: recipientIds.length,
    status: "sending",
  });
}

/**
 * Deliver broadcast messages directly to recipients via Zernio API.
 */
async function deliverBroadcastDirectly(
  supabase: SupabaseClient<Database>,
  broadcastId: string,
  workspaceId: string,
  text: string
) {
  try {
    const { data: recipients } = await supabase
      .from("broadcast_recipients")
      .select("id, contact_id, channel_id, channels(late_account_id, zernio_account_id)")
      .eq("broadcast_id", broadcastId)
      .eq("status", "pending");

    if (!recipients?.length) return;

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("late_api_key_encrypted")
      .eq("id", workspaceId)
      .single();

    const apiKey = workspace?.late_api_key_encrypted || process.env.ZERNIO_API_KEY;
    if (!apiKey) return;

    const { createZernioClient } = await import("@/lib/zernio-client");
    const zernio = createZernioClient(apiKey);

    let sentCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      try {
        const channel = rec.channels as { late_account_id?: string; zernio_account_id?: string } | null;
        const accountId = channel?.zernio_account_id || channel?.late_account_id;

        // 1. First attempt: existing conversation thread
        const { data: conv } = await supabase
          .from("conversations")
          .select("late_conversation_id")
          .eq("contact_id", rec.contact_id)
          .eq("channel_id", rec.channel_id)
          .limit(1)
          .maybeSingle();

        if (conv?.late_conversation_id && accountId) {
          await zernio.messages.sendInboxMessage({
            path: { conversationId: conv.late_conversation_id },
            body: { accountId, message: text },
          });

          await supabase
            .from("broadcast_recipients")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", rec.id);

          sentCount++;
        } else if (accountId) {
          // 2. Second attempt: Direct send by participant identifier
          const { data: contact } = await supabase
            .from("contacts")
            .select("metadata")
            .eq("id", rec.contact_id)
            .limit(1)
            .maybeSingle();

          const contactMeta = (contact?.metadata as Record<string, any>) || {};
          const participantId =
            contactMeta.phone ||
            contactMeta.phone_number ||
            contactMeta.participantId ||
            contactMeta.id;
          const participantUsername = contactMeta.username || contactMeta.handle;

          if (participantId || participantUsername) {
            await zernio.messages.createInboxConversation({
              body: {
                accountId,
                participantId: participantId || undefined,
                participantUsername: participantUsername || undefined,
                message: text,
              },
            });

            await supabase
              .from("broadcast_recipients")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("id", rec.id);

            sentCount++;
          } else {
            await supabase
              .from("broadcast_recipients")
              .update({
                status: "failed",
                error_message: "No active conversation or recipient handle found",
              })
              .eq("id", rec.id);
            failedCount++;
          }
        } else {
          await supabase
            .from("broadcast_recipients")
            .update({ status: "failed", error_message: "Channel account ID missing" })
            .eq("id", rec.id);
          failedCount++;
        }
      } catch (err: any) {
        await supabase
          .from("broadcast_recipients")
          .update({ status: "failed", error_message: err?.message || "Send failed" })
          .eq("id", rec.id);
        failedCount++;
      }
    }

    // Update broadcast summary stats
    await supabase
      .from("broadcasts")
      .update({
        status: "completed",
        sent: sentCount,
        failed: failedCount,
      })
      .eq("id", broadcastId);
  } catch (err) {
    console.error("[Broadcast] Direct delivery error:", err);
  }
}

/**
 * Resolve segment filter into contact IDs.
 * If no filter, returns all subscribed contacts in the workspace.
 */
async function resolveContacts(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  filter: SegmentFilter | null
): Promise<string[]> {
  // No filter = all subscribed contacts
  if (!filter || !filter.groups?.length) {
    const { data } = await supabase
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("is_subscribed", true)
      .limit(10000);
    return (data ?? []).map((c) => c.id);
  }

  // Start with all subscribed contacts
  const { data: allContacts } = await supabase
    .from("contacts")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("is_subscribed", true)
    .limit(10000);

  if (!allContacts?.length) return [];

  const allIds = new Set(allContacts.map((c) => c.id));

  // Evaluate each group
  const groupResults: Set<string>[] = [];

  for (const group of filter.groups) {
    const ruleResults: Set<string>[] = [];

    for (const rule of group.rules) {
      const ids = await evaluateRule(supabase, workspaceId, rule, allIds);
      ruleResults.push(ids);
    }

    // Combine rules within group
    let groupIds: Set<string>;
    if (group.combinator === "and") {
      groupIds = intersectSets(ruleResults);
    } else {
      groupIds = unionSets(ruleResults);
    }
    groupResults.push(groupIds);
  }

  // Combine groups
  let finalIds: Set<string>;
  if (filter.combinator === "and") {
    finalIds = intersectSets(groupResults);
  } else {
    finalIds = unionSets(groupResults);
  }

  return Array.from(finalIds);
}

async function evaluateRule(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  rule: SegmentRule,
  allContactIds: Set<string>
): Promise<Set<string>> {
  const contactIds = Array.from(allContactIds);

  switch (rule.field) {
    case "has_tag": {
      // Find tag by name
      const { data: tag } = await supabase
        .from("tags")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("name", rule.value)
        .single();

      if (!tag) return new Set();

      const { data: tagged } = await supabase
        .from("contact_tags")
        .select("contact_id")
        .eq("tag_id", tag.id)
        .in("contact_id", contactIds);

      return new Set((tagged ?? []).map((t) => t.contact_id));
    }

    case "missing_tag": {
      const { data: tag } = await supabase
        .from("tags")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("name", rule.value)
        .single();

      if (!tag) return new Set(contactIds); // Tag doesn't exist, all contacts "miss" it

      const { data: tagged } = await supabase
        .from("contact_tags")
        .select("contact_id")
        .eq("tag_id", tag.id)
        .in("contact_id", contactIds);

      const taggedSet = new Set((tagged ?? []).map((t) => t.contact_id));
      return new Set(contactIds.filter((id) => !taggedSet.has(id)));
    }

    case "platform": {
      const { data: channels } = await supabase
        .from("channels")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("platform", rule.value as Platform);

      if (!channels?.length) {
        return rule.operator === "not_equals" ? new Set(contactIds) : new Set();
      }

      const channelIds = channels.map((c) => c.id);
      const { data: links } = await supabase
        .from("contact_channels")
        .select("contact_id")
        .in("channel_id", channelIds)
        .in("contact_id", contactIds);

      const linkedSet = new Set((links ?? []).map((l) => l.contact_id));
      if (rule.operator === "not_equals") {
        return new Set(contactIds.filter((id) => !linkedSet.has(id)));
      }
      return linkedSet;
    }

    case "is_subscribed": {
      // Already filtered to subscribed, but handle explicit false
      if (rule.value === "false") {
        return new Set(); // We only target subscribed contacts
      }
      return new Set(contactIds);
    }

    case "last_interaction": {
      const date = new Date(rule.value).toISOString();
      let query = supabase
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspaceId)
        .in("id", contactIds);

      if (rule.operator === "before") {
        query = query.lt("last_interaction_at", date);
      } else {
        query = query.gt("last_interaction_at", date);
      }

      const { data } = await query;
      return new Set((data ?? []).map((c) => c.id));
    }

    case "custom_field": {
      // rule.value format: "field_slug:actual_value"
      const [slug, ...rest] = rule.value.split(":");
      const fieldValue = rest.join(":");

      const { data: fieldDef } = await supabase
        .from("custom_field_definitions")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("slug", slug)
        .single();

      if (!fieldDef) return new Set();

      let cfQuery = supabase
        .from("contact_custom_fields")
        .select("contact_id")
        .eq("field_id", fieldDef.id)
        .in("contact_id", contactIds);

      switch (rule.operator) {
        case "equals":
          cfQuery = cfQuery.eq("value", fieldValue);
          break;
        case "not_equals":
          cfQuery = cfQuery.neq("value", fieldValue);
          break;
        case "contains":
          cfQuery = cfQuery.ilike("value", `%${fieldValue}%`);
          break;
        case "gt":
          cfQuery = cfQuery.gt("value", fieldValue);
          break;
        case "lt":
          cfQuery = cfQuery.lt("value", fieldValue);
          break;
      }

      const { data } = await cfQuery;
      return new Set((data ?? []).map((c) => c.contact_id));
    }

    default:
      return new Set(contactIds);
  }
}

function intersectSets(sets: Set<string>[]): Set<string> {
  if (sets.length === 0) return new Set();
  const result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    for (const item of result) {
      if (!sets[i].has(item)) result.delete(item);
    }
  }
  return result;
}

function unionSets(sets: Set<string>[]): Set<string> {
  const result = new Set<string>();
  for (const s of sets) {
    for (const item of s) {
      result.add(item);
    }
  }
  return result;
}
