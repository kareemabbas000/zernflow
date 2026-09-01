import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZernioClient } from "@/lib/zernio-client";

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

/**
 * PATCH /api/v1/conversations/[conversationId]
 * Update conversation status (open, closed, archived, snoozed), assigned_to, etc.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { status, is_muted, is_automation_paused, assigned_to } = body;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("workspace_id, late_conversation_id")
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
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof status === "string") updates.status = status;
  if (typeof is_muted === "boolean") updates.is_muted = is_muted;
  if (typeof is_automation_paused === "boolean") updates.is_automation_paused = is_automation_paused;
  if (assigned_to !== undefined) updates.assigned_to = assigned_to;

  const { data: updated, error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
    .select("*, contacts(*)")
    .single();

  if (error) {
    logger.error("Failed to update conversation:", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }

  return NextResponse.json(updated);
}

/**
 * DELETE /api/v1/conversations/[conversationId]
 * Delete a conversation and its messages.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conversation } = await supabase
    .from("conversations")
    .select("workspace_id, late_conversation_id, channels(late_account_id, zernio_account_id)")
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
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Delete messages first
  await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId);

  // Delete flow sessions
  await supabase
    .from("flow_sessions")
    .delete()
    .eq("conversation_id", conversationId);

  // Delete conversation
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    logger.error("Failed to delete conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }

  return NextResponse.json({ success: true, deletedId: conversationId });
}
