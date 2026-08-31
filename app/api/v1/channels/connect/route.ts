import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureWorkspaceZernioProfile } from "@/lib/zernio-client";
import { generateOAuthState } from "@/lib/auth-state";
import { PLATFORMS, isSupportedPlatform, type Platform } from "@/lib/platforms";
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
 * POST /api/v1/channels/connect
 *
 * Initiates social channel connection for the current workspace.
 * Automatically provisions an isolated Zernio profile if not yet created,
 * generates a tamper-proof signed OAuth state, and returns the provider auth URL.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const authData = await getAuthenticatedUserAndWorkspace(supabase);
  if (!authData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user, workspace } = authData;

  // Check workspace status
  if (workspace.status === "suspended") {
    return NextResponse.json(
      { error: "This workspace is currently suspended. Please contact support." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { platform } = body;

  if (!isSupportedPlatform(platform)) {
    return NextResponse.json(
      { error: `Unsupported platform. Must be one of: ${PLATFORMS.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // 1. Ensure isolated Zernio profile exists for this workspace
    const { profileId, zernio } = await ensureWorkspaceZernioProfile(
      supabase,
      workspace.id,
      workspace.name
    );

    // 2. Generate secure cryptographic state token
    const state = generateOAuthState({
      workspaceId: workspace.id,
      userId: user.id,
      platform,
      zernioProfileId: profileId,
      ttlSeconds: 1800, // 30 minutes
    });

    const host = request.headers.get("host") || "localhost:3001";
    const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = request.nextUrl.origin || `${proto}://${host}`;
    const appUrl = origin.trim().replace(/\/$/, "");
    const callbackUrl = `${appUrl}/dashboard/channels/callback?state=${encodeURIComponent(state)}`;

    // 3. Platform-specific connect query options
    const queryOptions: Record<string, any> = {
      profileId,
      redirect_url: callbackUrl,
    };

    // Facebook and WhatsApp use headless mode for our custom selection UI
    if (platform === "facebook" || platform === "whatsapp") {
      queryOptions.headless = true;
    }

    // 4. Request connection URL from Zernio scoped to this profile
    const res = await zernio.connect.getConnectUrl({
      path: { platform: platform as any },
      query: queryOptions as any,
    });

    if (!res.data?.authUrl) {
      return NextResponse.json(
        { error: `Failed to generate connection URL for ${platform}.` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authUrl: res.data.authUrl,
      platform,
      workspaceId: workspace.id,
    });
  } catch (error) {
    logger.error("[channels/connect] Connection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate channel connection." },
      { status: 500 }
    );
  }
}
