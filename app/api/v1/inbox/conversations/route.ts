import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/inbox/conversations
 *
 * Fast endpoint for live real-time inbox refreshing.
 * Returns all conversations with contact details for the authenticated user's workspace.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*, contacts(*)")
      .eq("workspace_id", workspaceId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversations: conversations ?? [],
    });
  } catch (err) {
    console.error("[api/v1/inbox/conversations] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load conversations" },
      { status: 500 }
    );
  }
}
