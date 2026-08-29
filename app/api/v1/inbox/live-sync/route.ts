import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getPlatformZernioClient, createZernioClient } from "@/lib/zernio-client";
import { backfillInboxConversations } from "@/lib/inbox-sync";

/**
 * GET /api/v1/inbox/live-sync?workspaceId=...
 *
 * Lightweight background live-sync for the inbox.
 * Polls active channels, pulls any new incoming messages from provider APIs,
 * updates conversations in Supabase, and returns the latest conversation list.
 * Ensures the inbox is 100% dynamic even in local development or before webhooks trigger.
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

    const serviceClient = await createServiceClient();

    // 1. Fetch active channels for this workspace
    const { data: channels } = await serviceClient
      .from("channels")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true);

    // 2. Fetch workspace API key if customized
    const { data: workspace } = await serviceClient
      .from("workspaces")
      .select("late_api_key_encrypted")
      .eq("id", workspaceId)
      .single();

    const zernio = workspace?.late_api_key_encrypted
      ? createZernioClient(workspace.late_api_key_encrypted)
      : getPlatformZernioClient();

    // 3. Perform fast backfill across active channels
    if (channels && channels.length > 0) {
      try {
        await backfillInboxConversations({
          supabase: serviceClient,
          zernio,
          workspaceId,
          channels,
        });
      } catch (syncErr) {
        console.warn("[inbox/live-sync] Background backfill warning:", syncErr);
      }
    }

    // 4. Fetch latest conversations
    const { data: conversations } = await serviceClient
      .from("conversations")
      .select("*, contacts(*)")
      .eq("workspace_id", workspaceId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      conversations: conversations ?? [],
    });
  } catch (err) {
    console.error("[inbox/live-sync] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to sync inbox" },
      { status: 500 }
    );
  }
}
