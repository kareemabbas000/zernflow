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
import { motion, AnimatePresence } from "framer-motion";

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around border-t border-border/40 bg-background/80 backdrop-blur-2xl safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isInbox = item.href === "/dashboard/inbox";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-300 flex-1 h-full",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <item.icon className={cn("h-[22px] w-[22px] transition-transform", isActive && "scale-110")} />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-black text-white shadow-lg shadow-destructive/50 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex h-full flex-col bg-background/95 backdrop-blur-3xl border-r border-border/40 select-none shrink-0 relative z-40"
    >
      {/* Brand Header */}
      <div className="border-b border-border/40 px-5 py-4 flex items-center justify-between shrink-0 h-20">
        <Link href="/dashboard/inbox" className="group flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary via-blue-500 to-purple-600 p-[1.5px] shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
             <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Zap className="text-foreground h-5 w-5 group-hover:text-primary transition-colors" />
             </div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                className="text-xl font-black tracking-tight text-foreground whitespace-nowrap"
              >
                FlowStage
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }} 
            className="border-b border-border/40 px-5 py-4 bg-muted/10 shrink-0"
          >
            <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
                  "group relative flex items-center justify-center rounded-2xl p-3 mb-2 transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-6 w-6 relative z-10 transition-transform", isActive && "scale-110")} />
                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-black text-white shadow-lg shadow-destructive/50 z-20">
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
                "group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold mb-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 relative z-10">
                {isInbox && unreadCount > 0 ? (
                  <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-black text-white shadow-lg shadow-destructive/40">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : item.badge ? (
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border/40 p-4 space-y-3 bg-background/80 backdrop-blur-sm shrink-0">
        <AnimatePresence>
          {isSuperAdmin && !sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Link
                href="/admin"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all border border-destructive/20 shadow-sm"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Platform Admin
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Switcher */}
        {!sidebarCollapsed && mounted && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-muted/30">
            <span className="text-xs font-bold text-muted-foreground">Theme</span>
            <div className="flex items-center gap-1 bg-background/80 rounded-lg p-1 border border-border/50">
              <button
                onClick={() => setTheme("light")}
                className={cn("p-1.5 rounded-md transition-all", theme === "light" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                title="Light mode"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn("p-1.5 rounded-md transition-all", theme === "dark" ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
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
            className="rounded-2xl p-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full flex justify-center mb-2"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-2xl p-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full flex justify-center"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="rounded-2xl p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full flex justify-center"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
