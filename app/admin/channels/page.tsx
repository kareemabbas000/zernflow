import { requireSuperAdmin } from "@/lib/admin";
import { AdminChannelsView } from "@/components/admin/channels-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminChannelsPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const { data: channels } = await serviceClient
    .from("channels")
    .select("*, workspaces(id, name, slug)")
    .order("created_at", { ascending: false });

  return <AdminChannelsView initialChannels={(channels as any) || []} />;
}
