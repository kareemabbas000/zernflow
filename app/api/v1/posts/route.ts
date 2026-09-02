import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createZernioClient, ensureWorkspaceZernioProfile } from "@/lib/zernio-client";
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
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");
    const platformFilter = searchParams.get("platform");

    // Get all workspaces the user has access to
    const { data: userMemberships } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id);

    const userWsIds = (userMemberships || []).map((m) => m.workspace_id);

    let workspaceId = searchParams.get("workspaceId") || cookieStore.get(WORKSPACE_COOKIE)?.value || userWsIds[0];

    // Resolve channel(s)
    let channels: any[] = [];
    if (channelId && channelId !== "all") {
      const { data: singleCh } = await supabase
        .from("channels")
        .select("id, platform, zernio_account_id, late_account_id, display_name, is_active, workspace_id")
        .eq("id", channelId)
        .maybeSingle();

      if (singleCh) {
        channels = [singleCh];
        if (singleCh.workspace_id) {
          workspaceId = singleCh.workspace_id;
        }
      }
    }

    if (channels.length === 0) {
      let channelQuery = supabase
        .from("channels")
        .select("id, platform, zernio_account_id, late_account_id, display_name, is_active, workspace_id");

      if (workspaceId) {
        channelQuery = channelQuery.eq("workspace_id", workspaceId);
      } else if (userWsIds.length > 0) {
        channelQuery = channelQuery.in("workspace_id", userWsIds);
      }

      if (platformFilter && platformFilter !== "all") {
        channelQuery = channelQuery.eq("platform", platformFilter);
      }

      const { data: listCh } = await channelQuery;
      channels = listCh || [];
    }

    // Resilient Zernio Client & Profile setup
    let zernio: any;
    let profileId: string | null = null;
    if (workspaceId) {
      try {
        const prof = await ensureWorkspaceZernioProfile(supabase, workspaceId);
        zernio = prof.zernio;
        profileId = prof.profileId;
      } catch (profErr) {
        logger.warn("[posts/route] ensureWorkspaceZernioProfile fallback to direct key:", { error: String(profErr) });
      }
    }

    if (!zernio) {
      zernio = createZernioClient(process.env.ZERNIO_API_KEY);
    }

    const postMap = new Map<string, any>();

    // 1. Fetch published posts/reels for each connected channel account via listInboxComments
    if (channels && channels.length > 0) {
      await Promise.allSettled(
        channels.map(async (ch) => {
          const accountId = ch.zernio_account_id || ch.late_account_id;
          if (!accountId) return;

          try {
            const res = await (zernio.comments as any).listInboxComments({
              query: { accountId },
            });

            const items = res?.data?.data || res?.data?.posts || res?.data || [];
            if (Array.isArray(items)) {
              for (const item of items) {
                const postId = String(item.id || item.platformPostId || "");
                if (!postId) continue;

                const isReel =
                  item.permalink?.includes("/reel/") ||
                  item.mediaType === "video" ||
                  item.picture?.includes("CLIPS");

                postMap.set(postId, {
                  id: postId,
                  text: item.content || item.text || item.caption || "",
                  mediaUrl: item.picture || item.mediaUrl || item.thumbnailUrl || null,
                  mediaType: isReel ? "video" : "image",
                  platform: item.platform || ch.platform || "instagram",
                  permalink: item.permalink || null,
                  createdAt: item.createdTime || item.createdAt || new Date().toISOString(),
                  likesCount: item.likeCount ?? item.likesCount ?? 0,
                  commentsCount: item.commentCount ?? item.commentsCount ?? 0,
                  accountName: item.accountUsername || ch.display_name,
                });
              }
            }
          } catch (err) {
            logger.warn(`[posts/route] Could not fetch inbox comments for channel ${ch.display_name}:`, {
              error: String(err),
            });
          }
        })
      );
    }

    // 2. Also fetch scheduled / platform posts from Zernio posts API for complete coverage (Reddit, X, etc.)
    try {
      const postsRes = await (zernio.posts as any).listPosts({
        query: {
          profileId,
          limit: 100,
          sortBy: "createdAt:desc",
        },
      });

      const rawPosts = postsRes?.data?.posts || postsRes?.data?.data || postsRes?.data || [];
      if (Array.isArray(rawPosts)) {
        for (const p of rawPosts) {
          const postId = String(p.platformPostId || p._id || p.id || "");
          if (!postId || postMap.has(postId)) continue;

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

          const platform = p.platform || p.platforms?.[0] || platformFilter || "instagram";

          postMap.set(postId, {
            id: postId,
            text: p.content?.text || p.text || p.content?.caption || p.caption || "",
            mediaUrl,
            mediaType,
            platform,
            permalink: p.permalink || p.url || null,
            createdAt: p.createdAt || p.created_at || p.publishedAt || new Date().toISOString(),
            likesCount: p.metrics?.likes || p.likesCount || 0,
            commentsCount: p.metrics?.comments || p.commentsCount || 0,
            accountName: p.accountUsername || null,
          });
        }
      }
    } catch (err) {
      logger.warn("[posts/route] Could not fetch listPosts:", { error: String(err) });
    }

    // Convert map to sorted array (newest first)
    const formattedPosts = Array.from(postMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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
