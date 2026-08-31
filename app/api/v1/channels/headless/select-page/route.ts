import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { validateOAuthState } from "@/lib/auth-state";
import { getPlatformZernioClient } from "@/lib/zernio-client";
import {
  ensureWebhookRegistered,
  getOrCreateWorkspaceWebhookSecret,
} from "@/lib/zernio-webhook";
import { backfillInboxConversations } from "@/lib/inbox-sync";

import { isSupportedPlatform, type Platform } from "@/lib/platforms";

/**
 * POST /api/v1/channels/headless/select-page
 *
 * Headless Facebook / Instagram Page Selection Finalization:
 * Takes the user's selected Page ID, executes the select-page
 * call to Zernio server-side, maps the resulting connected social account
 * to the customer's workspace in Supabase, configures webhooks, and stamps audit logs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      state,
      pageId,
      pageName,
      username: requestedUsername,
      profilePicture: requestedProfilePicture,
      tempToken,
      userProfile,
    } = body;

    if (!state || !pageId || !tempToken) {
      return NextResponse.json(
        { error: "Missing required parameters (state, pageId, tempToken)." },
        { status: 400 }
      );
    }

    // 1. Validate signed OAuth state
    const validatedState = validateOAuthState(state);
    if (!validatedState) {
      return NextResponse.json(
        { error: "Invalid or expired authorization session. Please try again." },
        { status: 403 }
      );
    }

    // 2. Validate current authenticated user matches state
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== validatedState.userId) {
      return NextResponse.json({ error: "Unauthorized session mismatch." }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // 3. Verify workspace
    const { data: workspace } = await serviceClient
      .from("workspaces")
      .select("id, name, zernio_profile_id, status")
      .eq("id", validatedState.workspaceId)
      .single();

    if (!workspace || workspace.status === "suspended") {
      return NextResponse.json(
        { error: "Workspace not found or currently suspended." },
        { status: 403 }
      );
    }

    const profileId = validatedState.zernioProfileId || workspace.zernio_profile_id;
    if (!profileId) {
      return NextResponse.json(
        { error: "Missing workspace Zernio profile ID." },
        { status: 400 }
      );
    }

    // 4. Parse userProfile if needed
    let parsedProfile: { id?: string; name?: string; profilePicture?: string } = {};
    if (typeof userProfile === "string") {
      try {
        parsedProfile = JSON.parse(userProfile);
      } catch {
        parsedProfile = { id: user.id, name: user.user_metadata?.full_name };
      }
    } else if (typeof userProfile === "object" && userProfile !== null) {
      parsedProfile = userProfile;
    }

    // 5. Complete headless connection in Zernio
    const zernio = getPlatformZernioClient();
    const selectRes = await zernio.connect.facebook.selectFacebookPage({
      body: {
        profileId,
        pageId,
        tempToken,
        userProfile: parsedProfile,
      },
    });

    const targetPlatform: Platform =
      validatedState.platform && isSupportedPlatform(validatedState.platform)
        ? (validatedState.platform as Platform)
        : "facebook";
    const account = selectRes.data?.account;
    const accountId = account?.accountId || pageId;

    const displayName =
      pageName ||
      account?.displayName ||
      account?.selectedPageName ||
      `${targetPlatform === "instagram" ? "Instagram" : "Facebook"} Account`;

    const username = requestedUsername || account?.username || null;
    const profilePicture =
      requestedProfilePicture ||
      account?.profilePicture ||
      `https://graph.facebook.com/${pageId}/picture?type=normal`;

    // 6. Upsert channel in database
    const { data: channel, error: channelErr } = await serviceClient
      .from("channels")
      .upsert(
        {
          workspace_id: workspace.id,
          platform: targetPlatform,
          late_account_id: accountId,
          zernio_account_id: accountId,
          username,
          display_name: displayName,
          profile_picture: profilePicture,
          is_active: true,
          status: "connected",
          connected_at: new Date().toISOString(),
          disconnected_at: null,
          metadata: { pageId, pageName: displayName, targetPlatform },
        },
        { onConflict: "workspace_id, platform, late_account_id" }
      )
      .select("*")
      .single();

    if (channelErr) {
      console.error("[headless/select-page] Database channel upsert error:", channelErr);
      return NextResponse.json(
        { error: `Failed to save channel: ${channelErr.message}` },
        { status: 500 }
      );
    }

    // 7. Auto-register webhook
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
    } catch (whErr) {
      console.warn("[headless/select-page] Webhook registration warning:", whErr);
    }

    // 8. Stamp audit log
    await serviceClient.from("audit_logs").insert({
      actor_user_id: user.id,
      workspace_id: workspace.id,
      action: "channel.connected",
      target_type: "channel",
      target_id: accountId,
      metadata: {
        platform: targetPlatform,
        pageId,
        pageName: displayName,
        username,
      },
    });

    // 9. Backfill conversations asynchronously in the background
    try {
      if (channel) {
        after(async () => {
          try {
            await backfillInboxConversations({
              supabase: serviceClient,
              zernio,
              workspaceId: workspace.id,
              channels: [channel],
            });
          } catch (backfillErr) {
            console.warn("[headless/select-page] Backfill warning:", backfillErr);
          }
        });
      }
    } catch (e) {
      console.warn("after() failed:", e);
    }

    return NextResponse.json({
      success: true,
      channel,
      account,
      message: `Successfully connected Facebook Page "${displayName}".`,
    });
  } catch (error) {
    console.error("[headless/select-page] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to finalize Facebook page connection.",
      },
      { status: 500 }
    );
  }
}
