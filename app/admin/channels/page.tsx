import { requireSuperAdmin } from "@/lib/admin";
import { AdminChannelsView } from "@/components/admin/channels-view";
import { createServiceClient } from "@/lib/supabase/server";
import { syncAllPlatformChannelsAdmin } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminChannelsPage() {
  await requireSuperAdmin();

  // Auto-sync with Zernio on every server request so channels are always fresh
  try {
    await syncAllPlatformChannelsAdmin();
  } catch (err) {
    console.warn("[AdminChannelsPage] Auto-sync with Zernio warning:", err);
  }

  const serviceClient = await createServiceClient();

  const [{ data: channels }, { data: workspaces }] = await Promise.all([
    serviceClient
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false }),
    serviceClient
      .from("workspaces")
      .select("id, name, slug"),
  ]);

  const workspacesMap = new Map((workspaces || []).map((w) => [w.id, w]));

  const mapped = (channels || []).map((ch) => ({
    ...ch,
    workspaces: workspacesMap.get(ch.workspace_id) || null,
  }));

  return <AdminChannelsView initialChannels={mapped as any} />;
}
