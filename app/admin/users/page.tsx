import { requireSuperAdmin } from "@/lib/admin";
import { UsersView } from "@/components/admin/users-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user } = await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const { data: users } = await serviceClient
    .from("profiles")
    .select("*, workspace_members(workspace_id, role, workspaces(id, name, slug, status))")
    .order("created_at", { ascending: false });

  return <UsersView initialUsers={(users as any) || []} currentAdminId={user.id} />;
}
