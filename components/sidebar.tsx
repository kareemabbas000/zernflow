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
import { useUIStore, selectIsMobile } from "@/lib/stores/ui-store";
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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--paper)] safe-bottom">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors flex-1 h-full",
                isActive ? "text-[var(--brand)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"
              )}
            >
              <div className="relative z-10">
                <item.icon className="h-5 w-5" />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[8px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div
      style={{ width: sidebarCollapsed ? 64 : 260 }}
      className="flex h-full flex-col bg-[var(--surface-2)] border-r border-[var(--border)] select-none shrink-0 relative z-40 transition-[width] duration-200 ease-in-out font-sans text-sm"
    >
      {/* Brand Header */}
      <div className="border-b border-[var(--border)] px-4 py-4 flex items-center h-[60px] shrink-0">
        <Link href="/dashboard/inbox" className="flex items-center gap-2 overflow-hidden">
          <div className="h-8 w-8 rounded-md bg-[var(--brand)] text-white flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-bold text-[var(--ink)] whitespace-nowrap">
              FlowStage
            </span>
          )}
        </Link>
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="border-b border-[var(--border)] px-4 py-3 shrink-0">
          <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                  "relative flex items-center justify-center p-3 mb-1 mx-2 rounded-md transition-colors",
                  isActive
                    ? "bg-[var(--surface)] text-[var(--brand)]"
                    : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-[var(--danger)]" />
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center justify-between px-4 py-2 mb-0.5 mx-2 rounded-md transition-colors font-medium",
                isActive
                  ? "bg-[var(--surface)] text-[var(--brand)]"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[var(--brand)] rounded-r-full -ml-2" />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", isActive ? "text-[var(--brand)]" : "text-[var(--ink-3)]")} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isInbox && unreadCount > 0 ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--danger-soft)] px-1.5 text-[10px] font-bold text-[var(--danger)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : item.badge ? (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[var(--brand-soft)] text-[var(--brand)]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-[var(--border)] p-3 space-y-2 shrink-0">
        {isSuperAdmin && !sidebarCollapsed && (
          <Link
            href="/admin"
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Platform Admin
          </Link>
        )}

        {/* Theme Switcher */}
        {!sidebarCollapsed && mounted && (
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-[var(--ink-3)]">Theme</span>
            <div className="flex items-center gap-1 bg-[var(--surface)] rounded p-0.5 border border-[var(--border)]">
              <button
                onClick={() => setTheme("light")}
                className={cn("p-1 rounded transition-colors", theme === "light" ? "bg-white shadow-sm text-[var(--ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]")}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn("p-1 rounded transition-colors", theme === "dark" ? "bg-[var(--ink)] shadow-sm text-white" : "text-[var(--ink-3)] hover:text-[var(--ink)]")}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-md p-2 text-[var(--ink-3)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors w-full flex justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-md p-2 text-[var(--ink-3)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors w-full flex justify-center"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-[var(--ink-3)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-[var(--ink-3)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors"
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
