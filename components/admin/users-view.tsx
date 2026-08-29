"use client";

import { useState } from "react";
import {
  Search,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toggleUserStatus, updateUserPlatformRole } from "@/lib/actions/admin";
import type { Profile } from "@/lib/admin";

interface UserWithWorkspaces extends Profile {
  workspaces?: Array<{
    workspace_id: string;
    role: string;
    workspaces: {
      id: string;
      name: string;
      slug: string;
      status: string;
    } | null;
  }>;
}

export function UsersView({ initialUsers, currentAdminId }: { initialUsers: UserWithWorkspaces[]; currentAdminId: string }) {
  const [users, setUsers] = useState<UserWithWorkspaces[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || u.platform_role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  async function handleToggleStatus(user: UserWithWorkspaces) {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    setLoadingId(user.id);
    setFeedback(null);

    const res = await toggleUserStatus(user.id, nextStatus);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      setFeedback({
        message: `User ${user.email} marked as ${nextStatus}`,
        type: "success",
      });
    }
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleToggleRole(user: UserWithWorkspaces) {
    const nextRole = user.platform_role === "super_admin" ? "user" : "super_admin";
    setLoadingId(user.id);
    setFeedback(null);

    const res = await updateUserPlatformRole(user.id, nextRole);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, platform_role: nextRole } : u))
      );
      setFeedback({
        message: `User role updated to ${nextRole}`,
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
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, search, suspend, or elevate permissions for all registered platform accounts.
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
            placeholder="Search by name, email, or user ID..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">Standard User</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Platform Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Workspaces</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isExpanded = expandedUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary uppercase">
                            {(u.full_name || u.email || "U")[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{u.full_name || "Unnamed User"}</p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {u.platform_role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                            <ShieldAlert className="h-3 w-3" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            User
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                            u.status === "active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {u.workspaces?.length || 0} workspaces
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </td>

                      <td className="p-4 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u)}
                                disabled={loadingId === u.id}
                                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                                title={u.platform_role === "super_admin" ? "Demote to User" : "Elevate to Super Admin"}
                              >
                                <Shield className="h-3 w-3" />
                                {u.platform_role === "super_admin" ? "Demote" : "Make Admin"}
                              </button>

                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={loadingId === u.id}
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                                  u.status === "active"
                                    ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300"
                                    : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/60 dark:text-green-300"
                                }`}
                              >
                                {loadingId === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : u.status === "active" ? (
                                  <>
                                    <UserX className="h-3 w-3" /> Suspend
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3" /> Reactivate
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {isSelf && (
                            <span className="text-[10px] text-muted-foreground italic">
                              Current Session
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
