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
  Trash2,
  Edit3,
  X,
  Sparkles,
} from "lucide-react";
import {
  toggleWorkspaceStatus,
  deleteWorkspaceAdmin,
  updateWorkspaceDetailsAdmin,
} from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

  // Modals state
  const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceWithCounts | null>(null);
  const [editModalWs, setEditModalWs] = useState<WorkspaceWithCounts | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editPlan, setEditPlan] = useState("free");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editZernioProfileId, setEditZernioProfileId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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

  async function handleDeleteWorkspace() {
    if (!workspaceToDelete) return;
    setLoadingId(workspaceToDelete.id);
    setFeedback(null);

    const res = await deleteWorkspaceAdmin(workspaceToDelete.id);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceToDelete.id));
      setFeedback({
        message: `Workspace "${workspaceToDelete.name}" and all associated data permanently deleted.`,
        type: "success",
      });
    }
    setWorkspaceToDelete(null);
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  function openEditModal(ws: WorkspaceWithCounts) {
    setEditModalWs(ws);
    setEditName(ws.name);
    setEditSlug(ws.slug);
    setEditPlan(ws.plan);
    setEditStatus((ws.status as "active" | "suspended") || "active");
    setEditZernioProfileId(ws.zernio_profile_id || "");
  }

  async function handleSaveEdit() {
    if (!editModalWs) return;
    setEditLoading(true);

    const res = await updateWorkspaceDetailsAdmin(editModalWs.id, {
      name: editName.trim(),
      slug: editSlug.trim(),
      plan: editPlan,
      status: editStatus,
      zernioProfileId: editZernioProfileId.trim() || undefined,
    });

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === editModalWs.id
            ? {
                ...w,
                name: editName.trim(),
                slug: editSlug.trim(),
                plan: editPlan,
                status: editStatus,
                zernio_profile_id: editZernioProfileId.trim() || null,
              }
            : w
        )
      );
      setFeedback({
        message: `Workspace "${editName}" updated successfully.`,
        type: "success",
      });
      setEditModalWs(null);
    }
    setEditLoading(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full root control over multi-tenant workspaces, plans, quotas, and Zernio profile bindings.
          </p>
        </div>
        <div className="rounded-lg bg-card border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {filtered.length} Workspaces
        </div>
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
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-4">Workspace</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Zernio Profile</th>
                <th className="p-4">Channels</th>
                <th className="p-4 text-right">Root Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No workspaces matching criteria
                  </td>
                </tr>
              ) : (
                filtered.map((ws) => (
                  <tr key={ws.id} className="hover:bg-muted/30 transition-colors">
                    {/* Workspace details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {ws.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{ws.name}</div>
                          <div className="text-muted-foreground text-[11px] font-mono">
                            /{ws.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="p-4">
                      {ws.owner ? (
                        <div>
                          <div className="font-medium text-foreground">{ws.owner.full_name || "User"}</div>
                          <div className="text-muted-foreground text-[11px]">{ws.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No primary owner</span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                        <Sparkles className="h-3 w-3" />
                        {ws.plan}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ws.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                        }`}
                      >
                        {ws.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <PowerOff className="h-3 w-3" />
                        )}
                        {ws.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>

                    {/* Zernio Profile */}
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {ws.zernio_profile_id ? (
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {ws.zernio_profile_id}
                        </span>
                      ) : (
                        <span className="text-amber-500 italic">Not Provisioned</span>
                      )}
                    </td>

                    {/* Channels & Members */}
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Plug className="h-3.5 w-3.5" />
                          {ws.channelsCount ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {ws.membersCount ?? 0}
                        </span>
                      </div>
                    </td>

                    {/* Root Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Workspace */}
                        <button
                          onClick={() => openEditModal(ws)}
                          className="p-1.5 rounded-lg border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Edit Workspace & Plan"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(ws)}
                          disabled={loadingId === ws.id}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            ws.status === "active"
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50"
                              : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50"
                          }`}
                          title={ws.status === "active" ? "Suspend Workspace" : "Activate Workspace"}
                        >
                          {loadingId === ws.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : ws.status === "active" ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Delete Workspace */}
                        <button
                          onClick={() => setWorkspaceToDelete(ws)}
                          disabled={loadingId === ws.id}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 transition-colors"
                          title="Delete Workspace Permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Workspace Confirm Modal */}
      <ConfirmDialog
        open={Boolean(workspaceToDelete)}
        title="Delete Workspace Permanently"
        message={`Are you sure you want to completely delete workspace "${workspaceToDelete?.name}"? All channels, flows, contacts, broadcasts, and messages in this workspace will be deleted.`}
        confirmLabel="Delete Workspace"
        destructive={true}
        onCancel={() => setWorkspaceToDelete(null)}
        onConfirm={handleDeleteWorkspace}
      />

      {/* Edit Workspace Modal */}
      {editModalWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Edit Workspace Details</h3>
              <button
                onClick={() => setEditModalWs(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Plan Tier</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "active" | "suspended")}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Zernio Profile ID</label>
                <input
                  type="text"
                  value={editZernioProfileId}
                  onChange={(e) => setEditZernioProfileId(e.target.value)}
                  placeholder="e.g. prf_12345678"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditModalWs(null)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading || !editName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
