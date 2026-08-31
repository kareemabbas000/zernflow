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
  Trash2,
  KeyRound,
  Edit3,
  X,
  VenetianMask,
} from "lucide-react";
import {
  toggleUserStatus,
  updateUserPlatformRole,
  deleteUserAdmin,
  updateUserPasswordAdmin,
  updateUserProfileAdmin,
} from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

export function UsersView({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: UserWithWorkspaces[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<UserWithWorkspaces[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [userToDelete, setUserToDelete] = useState<UserWithWorkspaces | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserWithWorkspaces | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [editModalUser, setEditModalUser] = useState<UserWithWorkspaces | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "super_admin">("user");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editLoading, setEditLoading] = useState(false);

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

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setLoadingId(userToDelete.id);
    setFeedback(null);

    const res = await deleteUserAdmin(userToDelete.id);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setFeedback({
        message: `User ${userToDelete.email} and all auth records permanently deleted.`,
        type: "success",
      });
    }
    setUserToDelete(null);
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSavePassword() {
    if (!passwordModalUser || !newPassword.trim()) return;
    setPasswordLoading(true);

    const res = await updateUserPasswordAdmin(passwordModalUser.id, newPassword.trim());

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({
        message: `Password successfully updated for ${passwordModalUser.email}`,
        type: "success",
      });
      setPasswordModalUser(null);
      setNewPassword("");
    }
    setPasswordLoading(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  function openEditModal(user: UserWithWorkspaces) {
    setEditModalUser(user);
    setEditFullName(user.full_name || "");
    setEditEmail(user.email || "");
    setEditRole((user.platform_role as "user" | "super_admin") || "user");
    setEditStatus((user.status as "active" | "suspended") || "active");
  }

  async function handleSaveEdit() {
    if (!editModalUser) return;
    setEditLoading(true);

    const res = await updateUserProfileAdmin(editModalUser.id, {
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      platformRole: editRole,
      status: editStatus,
    });

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editModalUser.id
            ? {
                ...u,
                full_name: editFullName.trim(),
                email: editEmail.trim(),
                platform_role: editRole,
                status: editStatus,
              }
            : u
        )
      );
      setFeedback({
        message: `Profile updated successfully for ${editEmail}`,
        type: "success",
      });
      setEditModalUser(null);
    }
    setEditLoading(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Root control over user accounts, passwords, security roles, and memberships.
          </p>
        </div>
        <div className="rounded-lg bg-card border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {filteredUsers.length} Total Accounts
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
            <option value="user">User</option>
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
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Platform Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Workspaces</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Root Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminId;
                  const isExpanded = expandedUserId === u.id;
                  const workspaceCount = u.workspaces?.length || 0;

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      {/* User details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {u.full_name ? u.full_name[0].toUpperCase() : u.email?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              {u.full_name || "Unnamed User"}
                              {isCurrentAdmin && (
                                <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[10px]">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform Role */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            u.platform_role === "super_admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {u.platform_role === "super_admin" ? (
                            <ShieldAlert className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {u.platform_role === "super_admin" ? "Super Admin" : "Standard User"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            u.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {u.status === "active" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          {u.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Workspaces */}
                      <td className="p-4">
                        <button
                          onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                          className="flex items-center gap-1.5 font-medium hover:text-foreground text-muted-foreground"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {workspaceCount} {workspaceCount === 1 ? "Workspace" : "Workspaces"}
                          {workspaceCount > 0 && (
                            isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(u.created_at).toLocaleDateString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Root Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate */}
                          <button
                            onClick={() => {
                              setFeedback({
                                message: `Generating impersonation session for ${u.email}...`,
                                type: "success"
                              });
                              setTimeout(() => setFeedback(null), 3000);
                            }}
                            className="p-1.5 rounded-lg border border-input text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-colors"
                            title="Impersonate User"
                          >
                            <VenetianMask className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Edit Profile & Email"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPassword("");
                            }}
                            className="p-1.5 rounded-lg border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Set/Reset Password"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Toggle Status */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={loadingId === u.id}
                              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                u.status === "active"
                                  ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50"
                                  : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50"
                              }`}
                              title={u.status === "active" ? "Suspend Account" : "Reactivate Account"}
                            >
                              {loadingId === u.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : u.status === "active" ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete Account */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={loadingId === u.id}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 transition-colors"
                              title="Delete User Permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

      {/* Delete User Confirm Modal */}
      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Delete User Permanently"
        message={`Are you sure you want to completely delete user "${userToDelete?.email}"? This will delete all auth credentials, personal profiles, and memberships.`}
        confirmLabel="Delete User"
        destructive={true}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Change User Password</h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Directly set a new password for <span className="font-semibold">{passwordModalUser.email}</span>.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPasswordModalUser(null)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePassword}
                  disabled={passwordLoading || newPassword.length < 6}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Edit User Profile</h3>
              <button
                onClick={() => setEditModalUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Platform Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "user" | "super_admin")}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none"
                  >
                    <option value="user">User</option>
                    <option value="super_admin">Super Admin</option>
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

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditModalUser(null)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading || !editEmail.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
