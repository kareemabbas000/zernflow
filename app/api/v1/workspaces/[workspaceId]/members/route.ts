import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Verify requesting user has access to this workspace
    const { data: callerMembership } = await serviceClient
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!callerMembership) {
      return NextResponse.json({ error: "Unauthorized for this workspace" }, { status: 403 });
    }

    // Fetch workspace members
    const { data: members, error: membersErr } = await serviceClient
      .from("workspace_members")
      .select("workspace_id, user_id, role, created_at")
      .eq("workspace_id", workspaceId);

    if (membersErr) throw membersErr;

    // Fetch user details for each member
    const memberDetails = await Promise.all(
      (members ?? []).map(async (member) => {
        try {
          const {
            data: { user: memberUser },
          } = await serviceClient.auth.admin.getUserById(member.user_id);

          const name =
            memberUser?.user_metadata?.full_name ??
            memberUser?.user_metadata?.name ??
            memberUser?.email?.split("@")[0] ??
            "Team Member";

          return {
            userId: member.user_id,
            role: member.role,
            email: memberUser?.email ?? "",
            name,
            avatarUrl: memberUser?.user_metadata?.avatar_url ?? null,
          };
        } catch {
          return {
            userId: member.user_id,
            role: member.role,
            email: "",
            name: "Team Member",
            avatarUrl: null,
          };
        }
      })
    );

    return NextResponse.json({ members: memberDetails });
  } catch (err) {
    logger.error("[api/v1/workspaces/[id]/members] Error:", { error: String(err) });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load team members" },
      { status: 500 }
    );
  }
}
