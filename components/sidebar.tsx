"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, useState, useEffect } from "react";
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
  Bot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
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
  { name: "Live Inbox", href: "/dashboard/inbox", icon: MessageSquare, badge: "Live" },
  { name: "Automations", href: "/dashboard/flows", icon: GitBranch },
  { name: "Contacts CRM", href: "/dashboard/contacts", icon: Users },
  { name: "Broadcasts", href: "/dashboard/broadcasts", icon: Radio },
  { name: "Sequences", href: "/dashboard/sequences", icon: ListOrdered },
  { name: "Growth & AI", href: "/dashboard/growth", icon: Sparkles },
  { name: "Channels", href: "/dashboard/channels", icon: Plug },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

import { useGlobalLiveSync } from "@/components/providers/global-live-sync-provider";

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
  const { unreadCount } = useGlobalLiveSync();

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
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar select-none">
      {/* Brand Header */}
      <div className="border-b border-sidebar-border px-4 py-3.5 flex items-center justify-between">
        <Link href="/dashboard/inbox" className="hover:opacity-90 transition-opacity">
          <BrandLogo size="sm" />
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="border-b border-sidebar-border px-3 py-2.5 bg-sidebar-accent/30">
        <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
          Communication & AI
        </div>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

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
                    isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"
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

      {/* Sidebar Footer & Permanent Attribution */}
      <div className="border-t border-sidebar-border p-3 space-y-2 bg-sidebar">
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            KA COMM Admin
          </Link>
        )}

        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border px-2 py-1.5 text-[11px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
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
            © 2026 <span className="font-bold text-foreground">KA COMM</span>
          </p>
          <p className="text-[10px] font-medium text-primary/90 mt-0.5">
            Developed by Kareem Abbas
          </p>
        </div>
      </div>
    </div>
  );
}
