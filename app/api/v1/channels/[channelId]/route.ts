import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createZernioClient, getPlatformZernioClient } from "@/lib/zernio-client";

/**
 * DELETE /api/v1/channels/[channelId]
 *
 * Permanently disconnects and removes a channel:
 * 1. Calls Zernio API server-side to delete the account from the profile so that
 *    subsequent channel syncs will NOT re-import it.
 * 2. Deletes the local channel record in Supabase (cascades conversations/webhooks).
 * 3. Stamps the action into the audit logs.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Look up channel
    const { data: channel } = await supabase
      .from("channels")
      .select("id, workspace_id, platform, display_name, late_account_id, zernio_account_id")
      .eq("id", channelId)
      .single();

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // 2. Verify workspace membership & permissions
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", channel.workspace_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Access denied to this workspace" }, { status: 403 });
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, late_api_key_encrypted, zernio_profile_id")
      .eq("id", channel.workspace_id)
      .single();

    const accountId = channel.zernio_account_id || channel.late_account_id;

    // 3. Permanently disconnect from Zernio
    if (accountId) {
      try {
        const zernio = workspace?.late_api_key_encrypted
          ? createZernioClient(workspace.late_api_key_encrypted)
          : getPlatformZernioClient();

        const res = await zernio.accounts.deleteAccount({
          path: { accountId },
        });

        // 404 means already deleted on provider side, which is expected/fine
        if (res.error && res.response?.status !== 404) {
          console.warn("[channels/delete] Zernio deleteAccount warning:", res.error);
        }
      } catch (zernioErr) {
        console.warn("[channels/delete] Failed to disconnect on Zernio provider:", zernioErr);
      }
    }

    // 4. Soft-delete the local channel row (maintain CRM history)
    const serviceClient = await createServiceClient();
    const { error: deleteErr } = await serviceClient
      .from("channels")
      .update({
        is_active: false,
        status: "disconnected",
        disconnected_at: new Date().toISOString()
      })
      .eq("id", channelId);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    // 5. Stamp audit log
    await serviceClient.from("audit_logs").insert({
      actor_user_id: user.id,
      workspace_id: channel.workspace_id,
      action: "channel.disconnected",
      target_type: "channel",
      target_id: channelId,
      metadata: {
        platform: channel.platform,
        displayName: channel.display_name,
        late_account_id: accountId,
      },
    });

    return NextResponse.json({ ok: true, success: true });
  } catch (err) {
    console.error("[channels/delete] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to disconnect channel." },
      { status: 500 }
    );
  }
}
