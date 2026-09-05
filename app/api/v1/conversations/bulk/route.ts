import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, conversationIds, workspaceId } = body;

  if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
    return NextResponse.json({ error: "No conversations specified" }, { status: 400 });
  }

  // Basic tenant check
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    if (action === "delete") {
      // Must delete messages first due to foreign keys, or rely on CASCADE. 
      await supabase
        .from("messages")
        .delete()
        .in("conversation_id", conversationIds);

      await supabase
        .from("flow_sessions")
        .delete()
        .in("conversation_id", conversationIds);

      const { error } = await supabase
        .from("conversations")
        .delete()
        .in("id", conversationIds)
        .eq("workspace_id", workspaceId); // extra safety

      if (error) throw error;
      return NextResponse.json({ success: true, action: "delete", ids: conversationIds });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (action === "mark_read") {
      updates.unread_count = 0;
    } else if (action === "mark_unread") {
      updates.unread_count = 1;
    } else if (action === "archive") {
      updates.status = "archived";
    } else if (action === "open") {
      updates.status = "open";
    } else if (action === "close") {
      updates.status = "closed";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabase
      .from("conversations")
      .update(updates)
      .in("id", conversationIds)
      .eq("workspace_id", workspaceId);

    if (error) throw error;

    return NextResponse.json({ success: true, action, ids: conversationIds });
  } catch (error) {
    logger.error("Bulk action failed:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
