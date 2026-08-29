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
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import type { Profile } from "@/lib/admin";

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
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card select-none">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
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
