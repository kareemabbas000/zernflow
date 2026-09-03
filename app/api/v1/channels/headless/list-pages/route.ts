import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOAuthState } from "@/lib/auth-state";
import { getPlatformZernioClient } from "@/lib/zernio-client";

/**
 * POST /api/v1/channels/headless/list-pages
 *
 * Headless Facebook / Instagram Account Listing:
 * Validates the signed OAuth state and calls Zernio server-side to fetch
 * all available Facebook Pages / Instagram Business accounts.
 * For Instagram, resolves the linked Instagram Professional Account (@handle, avatar)
 * for each managed page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, tempToken, userProfile } = body;

    if (!state || !tempToken) {
      return NextResponse.json(
        { error: "Missing required parameters (state, tempToken)." },
        { status: 400 }
      );
    }

    // 1. Validate signed OAuth state
    const validatedState = validateOAuthState(state);
    if (!validatedState) {
      return NextResponse.json(
        { error: "Invalid or expired authorization session. Please try connecting again." },
        { status: 403 }
      );
    }

    // 2. Validate user session matches the state
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== validatedState.userId) {
      return NextResponse.json({ error: "Unauthorized session mismatch." }, { status: 401 });
    }

    // 3. Verify workspace access and profile ID
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, zernio_profile_id, status")
      .eq("id", validatedState.workspaceId)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    if (workspace.status === "suspended") {
      return NextResponse.json({ error: "Workspace is suspended." }, { status: 403 });
    }

    const profileId = validatedState.zernioProfileId || workspace.zernio_profile_id;
    if (!profileId) {
      return NextResponse.json(
        { error: "No Zernio profile provisioned for this workspace." },
        { status: 400 }
      );
    }

    // 4. Fetch available Facebook Pages from Zernio server-side
    const zernio = getPlatformZernioClient();
    const res = await zernio.connect.facebook.listFacebookPages({
      query: {
        profileId,
        tempToken,
      },
    });

    const rawPages = res.data?.pages ?? [];
    const isInstagram = validatedState.platform === "instagram";

    // 5. For Instagram, look up linked Instagram Business Accounts for each page
    const formattedAccounts = await Promise.all(
      (rawPages as any[]).map(async (p: any) => {
        let igAccount: {
          id: string;
          username?: string;
          name?: string;
          profilePicture?: string;
        } | null = null;

        if (isInstagram && p.id && p.access_token) {
          try {
            const igRes = await fetch(
              `https://graph.facebook.com/v20.0/${p.id}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${p.access_token}`,
              { signal: AbortSignal.timeout(3000) }
            );
            if (igRes.ok) {
              const igData = await igRes.json();
              if (igData.instagram_business_account) {
                const ig = igData.instagram_business_account;
                igAccount = {
                  id: ig.id,
                  username: ig.username,
                  name: ig.name || ig.username,
                  profilePicture: ig.profile_picture_url,
                };
              }
            }
          } catch (igErr) {
            console.warn(`[list-pages] Instagram account lookup warning for page ${p.id}:`, igErr);
          }
        }

        if (isInstagram) {
          const igUsername = igAccount?.username || p.username || null;
          const igDisplayName = igAccount?.name || igAccount?.username || p.name;
          const igAvatar = igAccount?.profilePicture || `https://graph.facebook.com/${p.id}/picture?type=normal`;

          return {
            id: p.id,
            pageId: p.id,
            name: igDisplayName,
            username: igUsername,
            category: igAccount ? "Instagram Business Account" : (p.category || "Instagram Connected Page"),
            profilePicture: igAvatar,
            hasLinkedInstagram: !!igAccount,
            instagramAccountId: igAccount?.id || null,
            parentPageName: p.name,
          };
        }

        return {
          id: p.id,
          pageId: p.id,
          name: p.name,
          username: p.username || null,
          category: p.category || null,
          tasks: p.tasks || [],
          profilePicture: `https://graph.facebook.com/${p.id}/picture?type=normal`,
          hasLinkedInstagram: false,
        };
      })
    );

    // If connecting Instagram, sort accounts with linked IG accounts to the top
    if (isInstagram) {
      formattedAccounts.sort((a, b) => (b.hasLinkedInstagram ? 1 : 0) - (a.hasLinkedInstagram ? 1 : 0));
    }

    return NextResponse.json({
      success: true,
      profileId,
      platform: validatedState.platform,
      workspaceId: validatedState.workspaceId,
      pages: formattedAccounts,
    });
  } catch (error) {
    logger.error("[headless/list-pages] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve accounts from provider.",
      },
      { status: 500 }
    );
  }
}
