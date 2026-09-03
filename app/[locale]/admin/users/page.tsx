import { requireSuperAdmin } from "@/lib/admin";
import { UsersView } from "@/components/admin/users-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user } = await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const [{ data: profiles }, { data: members }, { data: workspaces }] =
    await Promise.all([
      serviceClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      serviceClient
        .from("workspace_members")
        .select("user_id, workspace_id, role"),
      serviceClient
        .from("workspaces")
        .select("id, name, slug, status"),
    ]);

  const workspacesMap = new Map((workspaces || []).map((w) => [w.id, w]));

  const usersWithWorkspaces = (profiles || []).map((p) => {
    const userMembers = (members || []).filter((m) => m.user_id === p.id);
    const userWorkspaces = userMembers.map((m) => ({
      workspace_id: m.workspace_id,
      role: m.role,
      workspaces: workspacesMap.get(m.workspace_id) || null,
    }));

    return {
      ...p,
      workspaces: userWorkspaces,
    };
  });

  return <UsersView initialUsers={usersWithWorkspaces as any} currentAdminId={user.id} />;
}
