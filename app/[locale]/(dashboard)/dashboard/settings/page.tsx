import { getWorkspace } from "@/lib/workspace";
import { SettingsView } from "./settings-view";
import { getWorkspaceSubscription } from "@/lib/actions/billing";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const { workspace, user, role, supabase } = await getWorkspace();
  const subscription = await getWorkspaceSubscription();
  
  const { data: userData } = await supabase.auth.getUser();

  // Team data
  const serviceClient = await createServiceClient();
  const { data: members } = await serviceClient
    .from("workspace_members")
    .select("workspace_id, user_id, role, created_at")
    .eq("workspace_id", workspace.id);

  const memberDetails = await Promise.all(
    (members ?? []).map(async (member) => {
      const {
        data: { user: memberUser },
      } = await serviceClient.auth.admin.getUserById(member.user_id);

      return {
        userId: member.user_id,
        role: member.role,
        joinedAt: member.created_at,
        email: memberUser?.email ?? "Unknown",
        name:
          memberUser?.user_metadata?.full_name ??
          memberUser?.user_metadata?.name ??
          memberUser?.email?.split("@")[0] ??
          "Unknown",
      };
    })
  );

  const { data: pendingInvites } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <SettingsView
      workspace={{
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan || "free",
        status: workspace.status || "active",
        hasAiKey: !!workspace.ai_api_key,
        globalKeywords: (workspace.global_keywords as string[]) ?? [],
      }}
      subscription={subscription}
      user={userData?.user}
      teamData={{
        currentUserId: user.id,
        currentUserRole: role,
        members: memberDetails,
        pendingInvites: (pendingInvites ?? []).map((invite) => ({
          ...invite,
          created_at: invite.created_at ?? "",
          expires_at: invite.expires_at ?? "",
        })),
      }}
    />
  );
}
