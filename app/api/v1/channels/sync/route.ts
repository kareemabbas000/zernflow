import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ensureWorkspaceZernioProfile } from "@/lib/zernio-client";
import {
  ensureWebhookRegistered,
  getOrCreateWorkspaceWebhookSecret,
} from "@/lib/zernio-webhook";
import { backfillInboxConversations } from "@/lib/inbox-sync";
import { isSupportedPlatform } from "@/lib/platforms";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

async function getWorkspace(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(WORKSPACE_COOKIE)?.value;

  if (selectedId) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(*)")
      .eq("user_id", user.id)
      .eq("workspace_id", selectedId)
      .maybeSingle();

    if (membership?.workspaces) {
      const ws = Array.isArray(membership.workspaces)
        ? membership.workspaces[0]
        : membership.workspaces;
      if (ws) return { user, workspace: ws, role: membership.role };
    }
  }

  const { data: fallback } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!fallback?.workspaces) return null;
  const ws = Array.isArray(fallback.workspaces)
    ? fallback.workspaces[0]
    : fallback.workspaces;

  return ws ? { user, workspace: ws, role: fallback.role } : null;
}

/**
 * POST /api/v1/channels/sync
 *
 * Syncs social accounts for the current workspace's isolated Zernio profile.
 * - Creates new channels for newly authorized accounts.
 * - Updates metadata and ensures active status.
 * - Deletes/deactivates channels whose accounts no longer exist in Zernio.
 * - Ensures workspace webhook registration.
 * - Backfills initial inbox conversations.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const authData = await getWorkspace(supabase);
  if (!authData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user, workspace } = authData;

  try {
    const serviceClient = await createServiceClient();

    // 1. Ensure the isolated Zernio profile is provisioned
    const { profileId, zernio } = await ensureWorkspaceZernioProfile(
      supabase,
      workspace.id,
      workspace.name
    );

    // 2. List accounts for this profile from Zernio
    const res = await zernio.accounts.listAccounts({
      query: { profileId } as any,
    });
    const lateAccounts = res.data?.accounts ?? [];

    // 3. Get existing channels for this workspace
    const { data: existingChannels } = await serviceClient
      .from("channels")
      .select("*")
      .eq("workspace_id", workspace.id);

    const existingByPlatformAndId = new Map(
      (existingChannels ?? []).map((c) => [`${c.platform}:${c.zernio_account_id || c.late_account_id}`, c])
    );

    const lateAccountIds = new Set(
      lateAccounts.map((a: { _id?: string }) => a._id).filter(Boolean)
    );

    let created = 0;
    let updated = 0;
    const skipped: string[] = [];
    const failed: string[] = [];

    for (const account of lateAccounts) {
      if (!account._id) continue;

      if (!isSupportedPlatform(account.platform)) {
        if (account.platform) skipped.push(account.platform);
        continue;
      }

      const acc = account as typeof account & { profilePicture?: string };
      const profilePic = acc.profilePicture || null;
      const key = `${account.platform}:${account._id}`;
      const existing = existingByPlatformAndId.get(key);

      if (existing) {
        // If this is an Instagram channel, preserve the Instagram handle and display name
        const isInstagram = existing.platform === "instagram";
        const targetDisplayName = isInstagram
          ? (existing.display_name || account.displayName || account.username || null)
          : (account.displayName || account.username || null);
        const targetUsername = isInstagram
          ? (existing.username || account.username || null)
          : (account.username || null);

        if (
          existing.username !== targetUsername ||
          existing.display_name !== targetDisplayName ||
          existing.profile_picture !== profilePic ||
          !existing.is_active ||
          existing.status !== "connected"
        ) {
          await serviceClient
            .from("channels")
            .update({
              username: targetUsername,
              display_name: targetDisplayName,
              profile_picture: profilePic || existing.profile_picture,
              is_active: true,
              status: "connected",
              zernio_account_id: account._id,
              disconnected_at: null,
            })
            .eq("id", existing.id);
          updated++;
        }
      } else {
        const { error: insertErr } = await serviceClient.from("channels").insert({
          workspace_id: workspace.id,
          platform: account.platform,
          late_account_id: account._id,
          zernio_account_id: account._id,
          username: account.username || null,
          display_name: account.displayName || account.username || null,
          profile_picture: profilePic,
          is_active: true,
          status: "connected",
          connected_at: new Date().toISOString(),
        });

        if (insertErr) {
          logger.error("[channels/sync] channel insert failed:", insertErr);
          failed.push(`${account.platform}: ${insertErr.message}`);
          continue;
        }

        // Record audit log for new channel
        await serviceClient.from("audit_logs").insert({
          actor_user_id: user.id,
          workspace_id: workspace.id,
          action: "channel.connected",
          target_type: "channel",
          target_id: account._id,
          metadata: { platform: account.platform, username: account.username },
        });

        created++;
      }
    }

    // 4. Remove or deactivate channels whose Zernio accounts no longer exist
    let deactivated = 0;
    for (const channel of existingChannels ?? []) {
      const accId = channel.zernio_account_id || channel.late_account_id;
      if (!lateAccountIds.has(accId)) {
        await serviceClient
          .from("channels")
          .delete()
          .eq("id", channel.id);

        deactivated++;
      }
    }

    // 5. Auto-register workspace webhook
    try {
      const host = request.headers.get("host") || "localhost:3001";
      const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
      const appUrl = `${proto}://${host}`.replace(/\/$/, "");
      const secret = await getOrCreateWorkspaceWebhookSecret(serviceClient, workspace.id);
      await ensureWebhookRegistered(zernio, {
        appUrl,
        secret,
        events: ["message.received", "comment.received"],
      });
    } catch (err) {
      logger.error("[channels/sync] webhook auto-registration failed:", err);
    }

    // 6. Backfill conversations
    let conversationsImported = 0;
    try {
      const { data: activeChannels } = await serviceClient
        .from("channels")
        .select("id, late_account_id, platform")
        .eq("workspace_id", workspace.id)
        .eq("is_active", true);

      const { imported } = await backfillInboxConversations({
        supabase: serviceClient,
        zernio,
        workspaceId: workspace.id,
        channels: activeChannels ?? [],
      });
      conversationsImported = imported;
    } catch (err) {
      logger.error("[channels/sync] inbox backfill failed:", err);
    }

    // 7. Return updated channel list
    const { data: channels } = await serviceClient
      .from("channels")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      channels: channels ?? [],
      synced: {
        created,
        updated,
        deactivated,
        conversationsImported,
        skipped: [...new Set(skipped)],
        failed,
      },
    });
  } catch (error) {
    logger.error("Failed to sync channels:", error);
    return NextResponse.json(
      { error: `Failed to sync channels: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
