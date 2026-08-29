import { requireSuperAdmin } from "@/lib/admin";
import { WorkspacesView } from "@/components/admin/workspaces-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacesPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const [{ data: workspaces }, { data: profiles }, { data: members }, { data: channels }] =
    await Promise.all([
      serviceClient
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false }),
      serviceClient
        .from("profiles")
        .select("id, email, full_name"),
      serviceClient
        .from("workspace_members")
        .select("workspace_id"),
      serviceClient
        .from("channels")
        .select("workspace_id"),
    ]);

  const profilesMap = new Map((profiles || []).map((p) => [p.id, p]));

  const memberCounts: Record<string, number> = {};
  (members || []).forEach((m) => {
    memberCounts[m.workspace_id] = (memberCounts[m.workspace_id] || 0) + 1;
  });

  const channelCounts: Record<string, number> = {};
  (channels || []).forEach((c) => {
    channelCounts[c.workspace_id] = (channelCounts[c.workspace_id] || 0) + 1;
  });

  const mapped = (workspaces || []).map((ws) => ({
    ...ws,
    owner: ws.owner_id ? profilesMap.get(ws.owner_id) || null : null,
    membersCount: memberCounts[ws.id] || 1,
    channelsCount: channelCounts[ws.id] || 0,
  }));

  return <WorkspacesView initialWorkspaces={mapped as any} />;
}
