import { requireSuperAdmin } from "@/lib/admin";
import { SubscriptionsView } from "@/components/admin/subscriptions-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const [{ data: workspaces }, { data: channels }, { data: contacts }, { data: flows }] = await Promise.all([
    serviceClient
      .from("workspaces")
      .select("*, workspace_members(user_id, role, users(email))")
      .order("created_at", { ascending: false }),
    serviceClient.from("channels").select("id, workspace_id"),
    serviceClient.from("contacts").select("id, workspace_id"),
    serviceClient.from("flows").select("id, workspace_id"),
  ]);

  const wsData = (workspaces || []).map(ws => {
    const wsChannels = (channels || []).filter(c => c.workspace_id === ws.id).length;
    const wsContacts = (contacts || []).filter(c => c.workspace_id === ws.id).length;
    const wsFlows = (flows || []).filter(c => c.workspace_id === ws.id).length;
    
    return {
      ...ws,
      usage: {
        channels: wsChannels,
        contacts: wsContacts,
        flows: wsFlows
      }
    };
  });

  return <SubscriptionsView workspaces={wsData} />;
}
