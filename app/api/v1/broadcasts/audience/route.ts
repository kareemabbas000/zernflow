import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveContacts, type SegmentFilter } from "@/lib/audience";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const filter: SegmentFilter | null = body.filter;

    // Use the shared resolveContacts logic
    const contactIds = await resolveContacts(
      supabase,
      membership.workspace_id,
      filter
    );

    return NextResponse.json({ count: contactIds.length });
  } catch (error: any) {
    logger.error("Audience check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate audience" },
      { status: 500 }
    );
  }
}
