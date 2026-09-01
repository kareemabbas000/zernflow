import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ensureWorkspaceZernioProfile } from "@/lib/zernio-client";
import { WORKSPACE_COOKIE } from "@/lib/workspace";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const workspaceId = cookieStore.get(WORKSPACE_COOKIE)?.value;

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized for this workspace" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");
    
    // Ensure we have a valid Zernio profile for this workspace
    const { profileId, zernio } = await ensureWorkspaceZernioProfile(supabase, workspaceId);

    const queryOptions: Record<string, any> = {
      profileId,
      limit: 50,
      sortBy: "createdAt:desc"
    };

    if (channelId && channelId !== "all") {
      const { data: channel } = await supabase
        .from("channels")
        .select("late_account_id")
        .eq("id", channelId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (channel?.late_account_id) {
        queryOptions.accountId = channel.late_account_id;
      }
    }

    const res = await (zernio.posts as any).listPosts({ query: queryOptions });
    
    // Fallback if listPosts isn't exact
    const posts = res?.data?.posts || res?.data || [];
    
    // Transform slightly for the frontend if needed
    const formattedPosts = (Array.isArray(posts) ? posts : []).map((p: any) => ({
      id: p._id || p.id,
      text: p.content?.text || p.text || p.content?.caption || "",
      mediaUrl: p.content?.media?.[0]?.url || p.media?.[0]?.url || null,
      platform: p.platform || p.platforms?.[0] || "unknown",
      createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    logger.error("[posts/route] Error fetching posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts." },
      { status: 500 }
    );
  }
}
