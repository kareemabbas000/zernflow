import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureWorkspaceZernioProfile, getPlatformZernioClient } from "@/lib/zernio-client";
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
 * POST /api/v1/channels/telegram/initiate
 *
 * Generates an ephemeral Telegram integration access code for the workspace.
 * The customer adds our integration bot to their channel/group and sends the code.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authData = await getAuthenticatedUserAndWorkspace(supabase);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, workspace } = authData;

    if (workspace.status === "suspended") {
      return NextResponse.json({ error: "Workspace is suspended." }, { status: 403 });
    }

    const { profileId, zernio } = await ensureWorkspaceZernioProfile(
      supabase,
      workspace.id,
      workspace.name
    );

    const res = await zernio.connect.telegram.getTelegramConnectStatus({
      query: { profileId },
    });

    const data = res.data as any;

    if (!data?.code) {
      return NextResponse.json(
        { error: "Failed to generate Telegram integration code." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      code: data.code,
      expiresAt: data.expiresAt,
      expiresIn: data.expiresIn || 900,
      botUsername: data.botUsername || "ZernioScheduleBot",
      instructions: data.instructions || [
        `Add @${data.botUsername || "ZernioScheduleBot"} as an administrator to your Telegram channel or group.`,
        `Send the following message in your channel/group or to the bot: ${data.code} @YourChannel`,
      ],
      workspaceId: workspace.id,
    });
  } catch (error) {
    logger.error("[telegram/initiate] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initiate Telegram integration.",
      },
      { status: 500 }
    );
  }
}
