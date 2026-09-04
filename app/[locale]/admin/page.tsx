import { getAdminOverviewStats } from "@/lib/admin";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms";
import Link from "next/link";
import {
  Users,
  Building2,
  Plug,
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Activity,
  AlertTriangle,
  Wrench,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const kpis = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      href: "/admin/users",
      icon: Users,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50",
    },
    {
      name: "Total Workspaces",
      value: stats.totalWorkspaces,
      sub: `${stats.activeWorkspaces} active • ${stats.suspendedWorkspaces} suspended`,
      href: "/admin/workspaces",
      icon: Building2,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      name: "Connected Accounts",
      value: stats.totalChannels,
      href: "/admin/channels",
      icon: Plug,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      name: "Total Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      name: "Total Messages",
      value: stats.totalMessages,
      icon: MessagesSquare,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Production
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time platform metrics, user registrations, and social channel connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-xl px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            Audit Logs
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Platform Config
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/workspaces?action=create" className="group rounded-xl border border-border bg-card/60 backdrop-blur-xl p-4 hover:border-primary/50 transition-colors flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">Create Workspace</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Provision a new tenant environment</p>
          </div>
        </Link>
        <Link href="/admin/users?action=invite" className="group rounded-xl border border-border bg-card/60 backdrop-blur-xl p-4 hover:border-primary/50 transition-colors flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">Invite User</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Send a platform registration link</p>
          </div>
        </Link>
        <Link href="/admin/settings?action=maintenance" className="group rounded-xl border border-border bg-card/60 backdrop-blur-xl p-4 hover:border-primary/50 transition-colors flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">Maintenance Mode</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Toggle platform-wide maintenance</p>
          </div>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.name}
            className="relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-xl p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{kpi.name}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{kpi.value.toLocaleString()}</p>
              {kpi.sub && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{kpi.sub}</p>
              )}
            </div>
            {kpi.href && (
              <Link
                href={kpi.href}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                View details <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Channels by Platform Breakdown */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold">Connected Accounts by Platform</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Distribution of active social accounts across all workspaces
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(PLATFORM_LABELS).map(([platformKey, label]) => {
            const count = stats.platformCounts[platformKey] || 0;
            return (
              <div
                key={platformKey}
                className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/60 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <PlatformIcon platform={platformKey as Platform} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{label}</p>
                  <p className="text-sm font-bold text-foreground">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Users & Recent Workspaces */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-sm font-semibold">Recent Users</h2>
              <p className="text-xs text-muted-foreground">Latest registered customer accounts</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-border overflow-auto flex-1">
            {stats.recentUsers.length === 0 ? (
              <p className="p-5 text-center text-xs text-muted-foreground">No users registered yet.</p>
            ) : (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                      {(user.full_name || user.email || "U")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{user.full_name || "Unnamed User"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.platform_role === "super_admin" && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                        Admin
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        user.status === "active"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                          : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Workspaces */}
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-sm font-semibold">Recent Workspaces</h2>
              <p className="text-xs text-muted-foreground">Provisioned tenant environments</p>
            </div>
            <Link
              href="/admin/workspaces"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-border overflow-auto flex-1">
            {stats.recentWorkspaces.length === 0 ? (
              <p className="p-5 text-center text-xs text-muted-foreground">No workspaces created yet.</p>
            ) : (
              stats.recentWorkspaces.map((ws) => (
                <div key={ws.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{ws.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">
                        {ws.zernio_profile_id ? `Profile: ${ws.zernio_profile_id}` : "Profile pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                      {ws.plan}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        ws.status === "active"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                          : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {ws.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Timeline */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Recent Administrative & System Activity</h2>
            <p className="text-xs text-muted-foreground">Audit log trail of security actions</p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-medium text-primary hover:underline"
          >
            View full log
          </Link>
        </div>

        <div className="divide-y divide-border">
          {stats.recentAuditLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No audit logs recorded yet.</p>
          ) : (
            stats.recentAuditLogs.map((log: any) => (
              <div key={log.id} className="flex items-start justify-between py-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold font-mono text-primary">
                        {log.action}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        by {log.profiles?.email || log.actor_user_id?.slice(0, 8) || "System"}
                      </span>
                    </div>
                    {log.target_type && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Target: {log.target_type} ({log.target_id || "N/A"})
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(log.created_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
