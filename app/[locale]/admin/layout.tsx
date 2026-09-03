import { requireSuperAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireSuperAdmin();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
