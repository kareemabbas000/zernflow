import { getWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/sidebar";
import { GlobalLiveSyncProvider } from "@/components/providers/global-live-sync-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ResponsiveLayoutWrapper } from "@/components/responsive-layout-wrapper";
import { CommandPalette } from "@/components/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspace, user, supabase } = await getWorkspace();

  const [{ data: memberships }, { data: profile }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("role, workspaces(id, name, slug)")
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("platform_role")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const workspaces = (memberships ?? [])
    .map((m) => {
      const rawWs = m.workspaces as any;
      const wsObj = Array.isArray(rawWs) ? rawWs[0] : rawWs;
      if (!wsObj || !wsObj.id) return null;
      return {
        id: wsObj.id as string,
        name: wsObj.name as string,
        slug: wsObj.slug as string,
        role: m.role,
      };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null);

  const isSuperAdmin = profile?.platform_role === "super_admin";

  return (
    <QueryProvider>
      <GlobalLiveSyncProvider workspaceId={workspace.id}>
        <ResponsiveLayoutWrapper>
          <CommandPalette />
          <Sidebar
            workspace={workspace}
            user={user}
            workspaces={workspaces}
            isSuperAdmin={isSuperAdmin}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden overflow-x-hidden">{children}</main>
        </ResponsiveLayoutWrapper>
      </GlobalLiveSyncProvider>
    </QueryProvider>
  );
}
