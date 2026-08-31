import { requireSuperAdmin } from "@/lib/admin";
import { FeatureFlagsView } from "@/components/admin/feature-flags-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const [{ data: flags }, { data: workspaces }] = await Promise.all([
    serviceClient
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false }),
    serviceClient
      .from("workspaces")
      .select("id, name, slug"),
  ]);

  return <FeatureFlagsView initialFlags={flags || []} workspaces={workspaces || []} />;
}
