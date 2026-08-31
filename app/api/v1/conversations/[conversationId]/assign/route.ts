import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { assignedTo } = await request.json(); // UUID or null

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .update({ assigned_to: assignedTo })
      .eq("id", conversationId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conversation: data });
  } catch (err) {
    console.error("[api/v1/conversations/[id]/assign] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to assign" },
      { status: 500 }
    );
  }
}
