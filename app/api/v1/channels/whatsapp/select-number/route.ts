import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { validateOAuthState } from "@/lib/auth-state";
import { getPlatformZernioClient } from "@/lib/zernio-client";
import {
  ensureWebhookRegistered,
  getOrCreateWorkspaceWebhookSecret,
} from "@/lib/zernio-webhook";
import { backfillInboxConversations } from "@/lib/inbox-sync";

/**
 * POST /api/v1/channels/whatsapp/select-number
 *
 * Headless WhatsApp Phone Number Selection Finalization:
 * Binds the customer's selected WhatsApp Business phone number to their
 * workspace profile, creates the channel record in Supabase, and provisions webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, phoneNumberId, wabaId, displayPhoneNumber, verifiedName, tempToken, userProfile } = body;

    if (!state || !phoneNumberId || !tempToken) {
      return NextResponse.json(
        { error: "Missing required parameters (state, phoneNumberId, tempToken)." },
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

    // 2. Validate current authenticated user
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
    let parsedProfile: Record<string, unknown> = {};
    if (typeof userProfile === "string") {
      try {
        parsedProfile = JSON.parse(userProfile);
      } catch {
        parsedProfile = { id: user.id, name: user.user_metadata?.full_name };
      }
    } else if (typeof userProfile === "object" && userProfile !== null) {
      parsedProfile = userProfile;
    }

    // 5. Complete headless phone selection in Zernio
    const zernio = getPlatformZernioClient();
    const selectRes = await zernio.connect.completeWhatsAppPhoneSelection({
      body: {
        profileId,
        phoneNumberId,
        wabaId: wabaId || "",
        tempToken,
        userProfile: parsedProfile,
      },
    });

    const account = (selectRes.data as any)?.account;
    const accountId = account?.accountId || account?.id || phoneNumberId;
    const displayName = verifiedName || account?.displayName || displayPhoneNumber || "WhatsApp Business";
    const username = displayPhoneNumber || account?.username || phoneNumberId;

    // 6. Upsert channel in database
    const { data: channel, error: channelErr } = await serviceClient
      .from("channels")
      .upsert(
        {
          workspace_id: workspace.id,
          platform: "whatsapp",
          late_account_id: accountId,
          zernio_account_id: accountId,
          username,
          display_name: displayName,
          profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=25D366&color=fff`,
          is_active: true,
          status: "connected",
          connected_at: new Date().toISOString(),
          disconnected_at: null,
          metadata: {
            phoneNumberId,
            wabaId,
            displayPhoneNumber,
            verifiedName,
          },
        },
        { onConflict: "workspace_id, late_account_id" }
      )
      .select("*")
      .single();

    if (channelErr) {
      console.error("[whatsapp/select-number] Database channel upsert error:", channelErr);
      return NextResponse.json(
        { error: `Failed to save WhatsApp channel: ${channelErr.message}` },
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
      console.warn("[whatsapp/select-number] Webhook registration warning:", whErr);
    }

    // 8. Stamp audit log
    await serviceClient.from("audit_logs").insert({
      actor_user_id: user.id,
      workspace_id: workspace.id,
      action: "channel.connected",
      target_type: "channel",
      target_id: accountId,
      metadata: {
        platform: "whatsapp",
        phoneNumberId,
        displayPhoneNumber,
        verifiedName,
      },
    });

    // 9. Backfill conversations asynchronously
    try {
      if (channel) {
        await backfillInboxConversations({
          supabase: serviceClient,
          zernio,
          workspaceId: workspace.id,
          channels: [channel],
        });
      }
    } catch (backfillErr) {
      console.warn("[whatsapp/select-number] Backfill warning:", backfillErr);
    }

    return NextResponse.json({
      success: true,
      channel,
      message: `Successfully connected WhatsApp Business number "${displayName}".`,
    });
  } catch (error) {
    console.error("[whatsapp/select-number] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to finalize WhatsApp phone number connection.",
      },
      { status: 500 }
    );
  }
}
