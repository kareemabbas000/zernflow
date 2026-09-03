import { requireSuperAdmin } from "@/lib/admin";
import { AuditLogsView } from "@/components/admin/audit-logs-view";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const { data: logs } = await serviceClient
    .from("audit_logs")
    .select("*, profiles:actor_user_id(email, full_name), workspaces(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return <AuditLogsView initialLogs={(logs as any) || []} />;
}
