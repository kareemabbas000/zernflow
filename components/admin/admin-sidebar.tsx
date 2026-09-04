"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Plug,
  FileText,
  Sliders,
  ArrowLeft,
  ShieldAlert,
  Moon,
  Sun,
  CreditCard,
  Flag,
  Activity,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import type { Profile } from "@/lib/admin";
import { motion, AnimatePresence } from "framer-motion";

function subscribeToThemeClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const adminNavigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Workspaces", href: "/admin/workspaces", icon: Building2 },
  { name: "Connected Channels", href: "/admin/channels", icon: Plug },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
  { name: "System Health", href: "/admin/system", icon: Activity },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  { name: "Platform Settings", href: "/admin/settings", icon: Sliders },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
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

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur-3xl select-none relative z-40 shrink-0">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <BrandLogo size="sm" />
          </Link>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          KA COMM Administration
        </div>
        {adminNavigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors mb-1",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0 relative z-10 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-2">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspace
        </Link>

        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {dark ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        {/* Permanent KA COMM Attribution */}
        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-[10px] font-semibold text-muted-foreground">
            © 2026 <span className="font-bold text-foreground">KA COMM Admin</span>
          </p>
          <p className="text-[10px] font-medium text-primary mt-0.5">
            Developed by Kareem Abbas
          </p>
        </div>
      </div>
    </div>
  );
}
