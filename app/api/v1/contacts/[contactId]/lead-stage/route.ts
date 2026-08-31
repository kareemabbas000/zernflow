import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const { contactId } = await params;
    const { leadStage } = await request.json(); 

    if (!["lead", "negotiation", "won", "lost"].includes(leadStage)) {
      return NextResponse.json({ error: "Invalid lead stage" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await (supabase as any)
      .from("contacts")
      .update({ lead_stage: leadStage })
      .eq("id", contactId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, contact: data });
  } catch (err) {
    logger.error("[api/v1/contacts/[id]/lead-stage] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update lead stage" },
      { status: 500 }
    );
  }
}
