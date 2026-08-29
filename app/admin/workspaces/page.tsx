import { requireSuperAdmin } from "@/lib/admin";
import { WorkspacesView } from "@/components/admin/workspaces-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacesPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const { data: workspaces } = await serviceClient
    .from("workspaces")
    .select(`
      *,
      profiles:owner_id(email, full_name),
      workspace_members(count),
      channels(count)
    `)
    .order("created_at", { ascending: false });

  const mapped = (workspaces || []).map((ws: any) => ({
    ...ws,
    owner: ws.profiles,
    membersCount: ws.workspace_members?.[0]?.count || 1,
    channelsCount: ws.channels?.[0]?.count || 0,
  }));

  return <WorkspacesView initialWorkspaces={mapped} />;
}
