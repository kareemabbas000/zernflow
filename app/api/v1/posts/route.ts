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
    const platformFilter = searchParams.get("platform");
    
    // Ensure we have a valid Zernio profile for this workspace
    const { profileId, zernio } = await ensureWorkspaceZernioProfile(supabase, workspaceId);

    const queryOptions: Record<string, any> = {
      profileId,
      limit: 60,
      sortBy: "createdAt:desc"
    };

    let targetPlatform = platformFilter;

    if (channelId && channelId !== "all") {
      const { data: channel } = await supabase
        .from("channels")
        .select("late_account_id, zernio_account_id, platform")
        .eq("id", channelId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (channel?.late_account_id || channel?.zernio_account_id) {
        queryOptions.accountId = channel.zernio_account_id || channel.late_account_id;
      }
      if (channel?.platform) {
        targetPlatform = channel.platform;
      }
    }

    const res = await (zernio.posts as any).listPosts({ query: queryOptions });
    const rawPosts = res?.data?.posts || res?.data || [];
    
    const formattedPosts = (Array.isArray(rawPosts) ? rawPosts : []).map((p: any) => {
      const mediaList = p.content?.media || p.media || [];
      const firstMedia = mediaList[0];
      const mediaUrl =
        firstMedia?.url ||
        firstMedia?.thumbnailUrl ||
        p.content?.mediaUrl ||
        p.mediaUrl ||
        p.thumbnailUrl ||
        null;

      const mediaType =
        firstMedia?.type ||
        p.mediaType ||
        (mediaUrl?.includes(".mp4") ? "video" : "image");

      const platform = p.platform || p.platforms?.[0] || targetPlatform || "instagram";

      return {
        id: p.platformPostId || p._id || p.id,
        text: p.content?.text || p.text || p.content?.caption || p.caption || "",
        mediaUrl,
        mediaType,
        platform,
        permalink: p.permalink || p.url || (platform === "instagram" ? `https://instagram.com/p/${p.id}` : null),
        createdAt: p.createdAt || p.created_at || p.publishedAt || new Date().toISOString(),
        likesCount: p.metrics?.likes || p.likesCount || 0,
        commentsCount: p.metrics?.comments || p.commentsCount || 0,
      };
    });

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    logger.error("[posts/route] Error fetching posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts." },
      { status: 500 }
    );
  }
}
