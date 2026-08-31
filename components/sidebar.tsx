"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useEffect } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
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

function subscribeToThemeClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const navigation = [
  {
    name: "Live Inbox",
    href: "/dashboard/inbox",
    icon: MessageSquare,
    badge: "Live",
  },
  { name: "Automations", href: "/dashboard/flows", icon: GitBranch },
  { name: "Contacts CRM", href: "/dashboard/contacts", icon: Users },
  { name: "Broadcasts", href: "/dashboard/broadcasts", icon: Radio },
  { name: "Sequences", href: "/dashboard/sequences", icon: ListOrdered },
  { name: "Growth & AI", href: "/dashboard/growth", icon: Sparkles },
  { name: "Channels", href: "/dashboard/channels", icon: Plug },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ── Mobile Bottom Navigation ─────────────────────────────────────────────
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

  // ── Store state ─────────────────────────────────────────────────
  const unreadCount = useInboxStore((s) => s.unreadCount);
  const isMobile = useUIStore(selectIsMobile);
  const isDesktop = useUIStore(selectIsDesktop);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const setBreakpoint = useUIStore((s) => s.setBreakpoint);

  // ── Responsive breakpoint detection ─────────────────────────────
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

  const dark = useSyncExternalStore(
    subscribeToThemeClass,
    () => document.documentElement.classList.contains("dark"),
    () => false
  );

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    document.cookie = "zernflow_workspace_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }

  // ── Mobile: Bottom Navigation Bar ───────────────────────────────
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
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

  // ── Desktop/Tablet: Full or Collapsed Sidebar ───────────────────
  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar select-none transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="border-b border-sidebar-border px-3 py-3.5 flex items-center justify-between shrink-0">
        <Link
          href="/dashboard/inbox"
          className="hover:opacity-90 transition-opacity"
        >
          {sidebarCollapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">
              K
            </div>
          ) : (
            <BrandLogo size="sm" />
          )}
        </Link>
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="rounded-md p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="border-b border-sidebar-border px-3 py-2.5 bg-sidebar-accent/30 shrink-0">
          <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        </div>
      )}

      {/* Collapse expand button */}
      {sidebarCollapsed && (
        <div className="border-b border-sidebar-border px-2 py-2.5 flex justify-center shrink-0">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="rounded-md p-1.5 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
            Communication & AI
          </div>
        )}
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
                  "group relative flex items-center justify-center rounded-xl p-2.5 transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white animate-pulse">
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
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive
                      ? "text-primary-foreground"
                      : "text-sidebar-foreground/60"
                  )}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isInbox && unreadCount > 0 ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm shadow-rose-500/40 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-2 bg-sidebar shrink-0">
        {isSuperAdmin && !sidebarCollapsed && (
          <Link
            href="/admin"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            KA COMM Admin
          </Link>
        )}

        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleTheme}
              title={dark ? "Light mode" : "Dark mode"}
              className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
            >
              {dark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border px-2 py-1.5 text-[11px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {dark ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
                {dark ? "Light" : "Dark"}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border px-2 py-1.5 text-[11px] font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>

            {/* Permanent KA COMM Attribution */}
            <div className="pt-2 border-t border-sidebar-border/60 text-center">
              <p className="text-[10px] font-semibold text-sidebar-foreground/60">
                © 2026{" "}
                <span className="font-bold text-foreground">KA COMM</span>
              </p>
              <p className="text-[10px] font-medium text-primary/90 mt-0.5">
                Developed by Kareem Abbas
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
