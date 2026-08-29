"use client";

import { useState } from "react";
import {
  Search,
  Building2,
  Plug,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Power,
  PowerOff,
  ExternalLink,
  Layers,
  Key,
} from "lucide-react";
import { toggleWorkspaceStatus } from "@/lib/actions/admin";
import type { Workspace } from "@/lib/admin";

interface WorkspaceWithCounts extends Workspace {
  membersCount?: number;
  channelsCount?: number;
  owner?: {
    email: string;
    full_name: string | null;
  } | null;
}

export function WorkspacesView({ initialWorkspaces }: { initialWorkspaces: WorkspaceWithCounts[] }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithCounts[]>(initialWorkspaces);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.slug.toLowerCase().includes(search.toLowerCase()) ||
      (ws.zernio_profile_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (ws.owner?.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || ws.status === statusFilter;
    const matchesPlan = planFilter === "all" || ws.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  async function handleToggleStatus(workspace: WorkspaceWithCounts) {
    const nextStatus = workspace.status === "active" ? "suspended" : "active";
    setLoadingId(workspace.id);
    setFeedback(null);

    const res = await toggleWorkspaceStatus(workspace.id, nextStatus);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspace.id ? { ...w, status: nextStatus } : w))
      );
      setFeedback({
        message: `Workspace "${workspace.name}" marked as ${nextStatus}`,
        type: "success",
      });
    }
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspaces Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect multi-tenant customer workspaces, Zernio profile mappings, and manage workspace status.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by workspace name, slug, owner email, or Zernio profile ID..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4">Workspace</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Zernio Profile</th>
                <th className="p-4">Members & Channels</th>
                <th className="p-4">Status & Plan</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No workspaces matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ws) => (
                  <tr key={ws.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{ws.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{ws.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-foreground">{ws.owner?.full_name || "Owner"}</p>
                      <p className="text-[11px] text-muted-foreground">{ws.owner?.email || "No email"}</p>
                    </td>

                    <td className="p-4">
                      {ws.zernio_profile_id ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded">
                          <Key className="h-3 w-3" />
                          {ws.zernio_profile_id}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 italic">Not provisioned</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {ws.membersCount || 1}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Plug className="h-3.5 w-3.5" />
                          {ws.channelsCount || 0}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                          {ws.plan}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            ws.status === "active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {ws.status}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {new Date(ws.created_at).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(ws)}
                        disabled={loadingId === ws.id}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                          ws.status === "active"
                            ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300"
                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/60 dark:text-green-300"
                        }`}
                      >
                        {loadingId === ws.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : ws.status === "active" ? (
                          <>
                            <PowerOff className="h-3 w-3" /> Suspend
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3" /> Reactivate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
