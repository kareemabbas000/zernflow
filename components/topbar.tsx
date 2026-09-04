"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, User } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { UserMenu } from "@/components/user-menu";
import { NotificationDropdown } from "@/components/notification-dropdown";

export function Topbar({ user }: { user?: { email?: string; id?: string } }) {
  const pathname = usePathname();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  // Generate breadcrumbs from pathname
  const paths = pathname.split("/").filter(Boolean);
  // We want to skip 'dashboard' if it's the first segment for cleaner breadcrumbs
  const breadcrumbs = paths[0] === "dashboard" ? paths.slice(1) : paths;

  return (
    <header className="h-[60px] bg-[var(--paper)] border-b border-[var(--border)] px-4 lg:px-6 flex items-center justify-between shrink-0 font-sans sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="lg:hidden p-2 -ml-2 text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--ink-3)] font-medium capitalize">
          <span>Workspace</span>
          <span className="text-[var(--border-strong)]">/</span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                <span className={isLast ? "text-[var(--ink)] font-bold" : ""}>
                  {crumb.replace(/-/g, " ")}
                </span>
                {!isLast && <span className="text-[var(--border-strong)]">/</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Command Palette Trigger */}
        <button 
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-md text-sm text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--border-strong)] transition-colors w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </div>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[var(--border)] rounded text-[var(--ink-3)]">
            ⌘K
          </kbd>
        </button>

        <button 
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="sm:hidden p-2 text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
