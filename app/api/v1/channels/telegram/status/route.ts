import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ensureWorkspaceZernioProfile, getPlatformZernioClient } from "@/lib/zernio-client";
import {
  ensureWebhookRegistered,
  getOrCreateWorkspaceWebhookSecret,
} from "@/lib/zernio-webhook";
import { backfillInboxConversations } from "@/lib/inbox-sync";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

async function getAuthenticatedUserAndWorkspace(supabase: Awaited<ReturnType<typeof createClient>>) {
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
 * POST /api/v1/channels/telegram/status
 *
 * Polls the status of an ephemeral Telegram access code.
 * If the bot connection has been established, automatically registers the channel
 * in Supabase, maps it to the workspace, stamps audit logs, and configures webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authData = await getAuthenticatedUserAndWorkspace(supabase);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, workspace } = authData;

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Missing access code." }, { status: 400 });
    }

    const zernio = getPlatformZernioClient();
    const res = await zernio.connect.telegram.completeTelegramConnect({
      query: { code },
    });

    const data = res.data as any;

    if (data?.status === "connected") {
      const serviceClient = await createServiceClient();
      const account = data.account;
      const chatId = data.chatId || account?._id;
      const displayName = data.chatTitle || account?.displayName || account?.username || "Telegram Channel";
      const username = account?.username || chatId;
      const accountId = account?._id || chatId;

      // Upsert channel in database
      const { data: channel, error: channelErr } = await serviceClient
        .from("channels")
        .upsert(
          {
            workspace_id: workspace.id,
            platform: "telegram",
            late_account_id: accountId,
            zernio_account_id: accountId,
            username: username ? `@${username.replace(/^@/, "")}` : null,
            display_name: displayName,
            profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=229ED9&color=fff`,
            is_active: true,
            status: "connected",
            connected_at: new Date().toISOString(),
            disconnected_at: null,
            metadata: {
              chatId,
              chatTitle: data.chatTitle,
              chatType: data.chatType,
            },
          },
          { onConflict: "workspace_id, late_account_id" }
        )
        .select("*")
        .single();

      if (channelErr) {
        console.error("[telegram/status] Channel upsert error:", channelErr);
      }

      // Auto-register webhook
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
        console.warn("[telegram/status] Webhook registration warning:", whErr);
      }

      // Stamp audit log
      await serviceClient.from("audit_logs").insert({
        actor_user_id: user.id,
        workspace_id: workspace.id,
        action: "channel.connected",
        target_type: "channel",
        target_id: accountId,
        metadata: {
          platform: "telegram",
          chatId,
          displayName,
          username,
        },
      });

      // Backfill conversations asynchronously
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
        console.warn("[telegram/status] Backfill warning:", backfillErr);
      }

      return NextResponse.json({
        status: "connected",
        connected: true,
        channel,
        message: `Successfully connected "${displayName}".`,
      });
    }

    if (data?.status === "expired") {
      return NextResponse.json({
        status: "expired",
        connected: false,
        message: "Telegram access code has expired. Please generate a new code.",
      });
    }

    return NextResponse.json({
      status: "pending",
      connected: false,
      expiresIn: data?.expiresIn,
    });
  } catch (error) {
    console.error("[telegram/status] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check Telegram status.",
      },
      { status: 500 }
    );
  }
}
