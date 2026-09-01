import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZernioClient } from "@/lib/zernio-client";
import { backfillInboxConversations } from "@/lib/inbox-sync";

/**
 * GET /api/v1/inbox/conversations
 *
 * Fast endpoint for live real-time inbox refreshing with AJAX pagination
 * and on-demand platform history backfill.
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

    const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get("limit") || "30", 10), 1), 100);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);
    const status = request.nextUrl.searchParams.get("status");
    const platform = request.nextUrl.searchParams.get("platform");
    const syncMore = request.nextUrl.searchParams.get("syncMore") === "true";

    // On-demand deep-dive sync from platform if requested
    if (syncMore) {
      try {
        const { data: workspace } = await supabase
          .from("workspaces")
          .select("late_api_key_encrypted")
          .eq("id", workspaceId)
          .single();

        const { data: activeChannels } = await supabase
          .from("channels")
          .select("id, late_account_id, platform")
          .eq("workspace_id", workspaceId)
          .eq("is_active", true);

        if (workspace?.late_api_key_encrypted && activeChannels && activeChannels.length > 0) {
          const zernio = createZernioClient(workspace.late_api_key_encrypted);
          await backfillInboxConversations({
            supabase,
            zernio,
            workspaceId,
            channels: activeChannels as any,
          });
        }
      } catch (syncErr) {
        logger.warn("[api/v1/inbox/conversations] syncMore warning:", { error: String(syncErr) });
      }
    }

    let query = supabase
      .from("conversations")
      .select("*, contacts(*), channels!inner(id, display_name, platform, is_active)", { count: "exact" })
      .eq("workspace_id", workspaceId)
      .eq("channels.is_active", true);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (platform && platform !== "all") {
      query = query.eq("platform", platform);
    }

    const { data: conversations, count, error } = await query
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get true global unread count
    const { data: counts } = await (supabase as any).rpc("get_workspace_unread_counts", {
      ws_id: workspaceId,
    });

    const total = count ?? (conversations?.length || 0);
    const hasMore = offset + (conversations?.length || 0) < total;

    return NextResponse.json({
      success: true,
      conversations: conversations ?? [],
      globalUnreadCounts: counts,
      total,
      hasMore,
      limit,
      offset,
    });
  } catch (err) {
    logger.error("[api/v1/inbox/conversations] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load conversations" },
      { status: 500 }
    );
  }
}
