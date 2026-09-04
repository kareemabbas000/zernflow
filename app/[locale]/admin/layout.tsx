import { requireSuperAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireSuperAdmin();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground relative">
      {/* Global Admin Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-auto relative z-10 bg-background/50">{children}</main>
    </div>
  );
}
