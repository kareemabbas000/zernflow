"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  GitBranch,
  Users,
  Radio,
  ListOrdered,
  BarChart3,
  Sparkles,
  Plug,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShieldAlert,
  Menu,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useUIStore, selectIsMobile, selectIsDesktop } from "@/lib/stores/ui-store";
import type { Database } from "@/lib/types/database";

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
}

const navigation = [
  { name: "Live Inbox", href: "/dashboard/inbox", icon: MessageSquare, badge: "Live" },
  { name: "Flow Studio", href: "/dashboard/flows", icon: GitBranch },
  { name: "Contacts CRM", href: "/dashboard/contacts", icon: Users },
  { name: "Broadcasts", href: "/dashboard/broadcasts", icon: Radio },
  { name: "Sequences", href: "/dashboard/sequences", icon: ListOrdered },
  { name: "AI Copilot", href: "/dashboard/growth", icon: Sparkles },
  { name: "Channels", href: "/dashboard/channels", icon: Plug },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const mobileNavItems = [
  { name: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
  { name: "Flows", href: "/dashboard/flows", icon: GitBranch },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Channels", href: "/dashboard/channels", icon: Plug },
  { name: "More", href: "/dashboard/settings", icon: Menu },
];

export function Sidebar({
  workspace,
  workspaces,
  isSuperAdmin,
}: {
  workspace: Workspace;
  user: { id: string; email?: string };
  workspaces: WorkspaceItem[];
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = useInboxStore((s) => s.unreadCount);
  const isMobile = useUIStore(selectIsMobile);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const setBreakpoint = useUIStore((s) => s.setBreakpoint);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      if (w < 768) setBreakpoint("mobile");
      else if (w < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setBreakpoint]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    document.cookie = "zernflow_workspace_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-sidebar/80 backdrop-blur-xl safe-bottom">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-all duration-300",
                isActive ? "text-sidebar-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]")} />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground shadow-lg shadow-primary/50">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border select-none transition-all duration-300 shrink-0 relative z-40",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="border-b border-sidebar-border px-4 py-4 flex items-center justify-between shrink-0 h-16">
        <Link href="/dashboard/inbox" className="hover:opacity-80 transition-opacity flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 p-[1px] shrink-0">
             <div className="w-full h-full bg-sidebar rounded-lg flex items-center justify-center">
                <Zap className="text-foreground h-4 w-4" />
             </div>
          </div>
          {!sidebarCollapsed && <span className="text-lg font-bold tracking-tight text-sidebar-foreground whitespace-nowrap">FlowStage</span>}
        </Link>
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="border-b border-sidebar-border px-4 py-3 bg-muted/20 shrink-0">
          <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

          if (sidebarCollapsed) {
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  "group relative flex items-center justify-center rounded-xl p-3 mb-1 transition-all duration-300",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md border border-border"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[8px] font-black text-primary-foreground animate-pulse shadow-lg shadow-primary/50">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium mb-1 transition-all duration-300",
                isActive
                  ? "bg-accent text-accent-foreground shadow-md border border-border"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4.5 w-4.5 transition-transform group-hover:scale-110", isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isInbox && unreadCount > 0 ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/40 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : item.badge ? (
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2 bg-sidebar shrink-0">
        {isSuperAdmin && !sidebarCollapsed && (
          <Link
            href="/admin"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all border border-destructive/20"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Platform Admin
          </Link>
        )}

        {/* Theme Switcher */}
        {!sidebarCollapsed && mounted && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background/50">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={cn("p-1.5 rounded-md transition-all", theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                title="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn("p-1.5 rounded-md transition-all", theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                title="Dark mode"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {sidebarCollapsed && mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full flex justify-center mb-1 border border-transparent"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full flex justify-center border border-transparent"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full flex justify-center border border-transparent"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
