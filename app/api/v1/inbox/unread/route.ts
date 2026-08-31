import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data, error } = await (supabase as any).rpc("get_workspace_unread_counts", {
      ws_id: workspaceId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      counts: data,
    });
  } catch (err) {
    logger.error("[api/v1/inbox/unread] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load unread counts" },
      { status: 500 }
    );
  }
}
