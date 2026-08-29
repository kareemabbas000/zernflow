import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOAuthState } from "@/lib/auth-state";
import { getPlatformZernioClient } from "@/lib/zernio-client";

/**
 * POST /api/v1/channels/whatsapp/list-numbers
 *
 * Headless WhatsApp WABA Phone Numbers Listing:
 * When a customer's WhatsApp Business Account (WABA) contains multiple
 * phone numbers, this endpoint retrieves the list of numbers server-side
 * and returns them to our custom white-label selector UI.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, tempToken } = body;

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

    // 2. Validate authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== validatedState.userId) {
      return NextResponse.json({ error: "Unauthorized session mismatch." }, { status: 401 });
    }

    // 3. Verify workspace & profile ID
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, zernio_profile_id, status")
      .eq("id", validatedState.workspaceId)
      .single();

    if (!workspace || workspace.status === "suspended") {
      return NextResponse.json({ error: "Workspace not accessible." }, { status: 403 });
    }

    const profileId = validatedState.zernioProfileId || workspace.zernio_profile_id;
    if (!profileId) {
      return NextResponse.json(
        { error: "No Zernio profile provisioned for this workspace." },
        { status: 400 }
      );
    }

    // 4. Fetch available WhatsApp phone numbers from Zernio
    const zernio = getPlatformZernioClient();
    const res = await zernio.connect.listWhatsAppPhoneNumbers({
      query: {
        profileId,
        tempToken,
      },
    });

    const rawNumbers = res.data?.phoneNumbers ?? [];

    const phoneNumbers = (rawNumbers as any[]).map((num: any) => ({
      id: num.id,
      displayPhoneNumber: num.display_phone_number || num.id,
      verifiedName: num.verified_name || "WhatsApp Business",
      qualityRating: num.quality_rating || "UNKNOWN",
      nameStatus: num.name_status || "APPROVED",
      wabaId: num.wabaId || "",
      wabaName: num.wabaName || "WhatsApp Business Account",
      messagingLimitTier: num.messaging_limit_tier || "TIER_250",
    }));

    return NextResponse.json({
      success: true,
      profileId,
      workspaceId: validatedState.workspaceId,
      phoneNumbers,
    });
  } catch (error) {
    console.error("[whatsapp/list-numbers] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve WhatsApp phone numbers.",
      },
      { status: 500 }
    );
  }
}
