"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Mail,
  Crown,
  Shield,
  User,
  Trash2,
  X,
  Clock,
  Plus,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  inviteTeamMember,
  removeTeamMember,
  revokeInvite,
} from "@/lib/actions/team";
import Link from "next/link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface MemberDetail {
  userId: string;
  role: string;
  joinedAt: string;
  email: string;
  name: string;
}

interface PendingInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  invited_by: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3.5 w-3.5" />,
  admin: <Shield className="h-3.5 w-3.5" />,
  member: <User className="h-3.5 w-3.5" />,
};

const roleStyles: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  member: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function TeamView({
  workspaceId,
  workspaceName,
  currentUserId,
  currentUserRole,
  members: initialMembers,
  pendingInvites: initialInvites,
}: {
  workspaceId: string;
  workspaceName: string;
  currentUserId: string;
  currentUserRole: string;
  members: MemberDetail[];
  pendingInvites: PendingInvite[];
}) {
  const router = useRouter();
  const isOwner = currentUserRole === "owner";

  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Remove member
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; name: string } | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || inviting) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    const result = await inviteTeamMember(workspaceId, inviteEmail, inviteRole);

    if (result.error) {
      setInviteError(result.error);
    } else if (result.invite) {
      setInvites((prev) => [result.invite as PendingInvite, ...prev]);
      setInviteEmail("");
      setInviteRole("member");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    }

    setInviting(false);
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);

    const result = await removeTeamMember(workspaceId, userId);

    if (!result.error) {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    }

    setRemovingId(null);
  }

  async function handleRevoke(inviteId: string) {
    setRevokingId(inviteId);

    const result = await revokeInvite(inviteId);

    if (!result.error) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }

    setRevokingId(null);
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border bg-background/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              Team Management
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage members and invitations for <span className="font-bold text-foreground">{workspaceName}</span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-4xl space-y-10 px-8 py-8">
          
          {/* Invite section (owners only) */}
          {isOwner && (
            <motion.section variants={itemVariants} className="group relative rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:border-primary/30">
              <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Invite a Member</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Send an invitation link. The invite expires in 7 days.</p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="mt-6 flex flex-col sm:flex-row gap-4 relative z-10">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  placeholder="colleague@example.com"
                  required
                  className="flex-1 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all appearance-none pr-10 bg-no-repeat cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundPosition: "right 0.75rem center", backgroundSize: "1em" }}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={!inviteEmail.trim() || inviting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all min-w-[120px]"
                >
                  {inviting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  {inviting ? "Inviting..." : "Invite"}
                </button>
              </form>

              <AnimatePresence>
                {inviteError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-sm font-bold text-rose-600 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 relative z-10">
                    {inviteError}
                  </motion.p>
                )}
                {inviteSuccess && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-sm font-bold text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 relative z-10">
                    Invite sent successfully!
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* Members list */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6 px-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground">
                Active Members <span className="ml-2 inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-black">{members.length}</span>
              </h2>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {members.map((member) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={member.userId}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0 mb-4 sm:mb-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-black text-primary shadow-inner border border-primary/10">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-foreground truncate">
                            {member.name}
                          </p>
                          {member.userId === currentUserId && (
                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:ml-4">
                      <div className="flex flex-col sm:items-end gap-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold capitalize shadow-sm",
                            roleStyles[member.role] ?? roleStyles.member
                          )}
                        >
                          {roleIcons[member.role] ?? roleIcons.member}
                          {member.role}
                        </span>

                        <span className="text-xs font-semibold text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {isOwner && member.userId !== currentUserId && (
                        <button
                          onClick={() =>
                            setConfirmRemove({ userId: member.userId, name: member.name })
                          }
                          disabled={removingId === member.userId}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/5 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                          title="Remove member"
                        >
                          {removingId === member.userId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Pending invites */}
          {invites.length > 0 && (
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6 px-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">
                  Pending Invites <span className="ml-2 inline-flex items-center justify-center bg-amber-500/10 text-amber-600 rounded-full px-2.5 py-0.5 text-xs font-black">{invites.length}</span>
                </h2>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {invites.map((invite) => {
                    const isExpired = new Date(invite.expires_at) < new Date();
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={invite.id}
                        className={cn(
                          "group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-sm transition-all",
                          isExpired && "opacity-60 grayscale"
                        )}
                      >
                        <div className="flex items-center gap-4 min-w-0 mb-4 sm:mb-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted border border-border">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-bold text-foreground truncate">
                              {invite.email}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-bold capitalize",
                                  roleStyles[invite.role] ?? roleStyles.member
                                )}
                              >
                                {roleIcons[invite.role] ?? roleIcons.member}
                                {invite.role}
                              </span>
                              {isExpired ? (
                                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                                  Expired
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  Expires {new Date(invite.expires_at).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isOwner && (
                          <div className="flex sm:justify-end">
                            <button
                              onClick={() => setConfirmRevoke(invite.id)}
                              disabled={revokingId === invite.id}
                              className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 w-full sm:w-auto justify-center"
                              title="Revoke invite"
                            >
                              {revokingId === invite.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              Revoke
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmRemove?.name ?? "this member"} from the workspace? They will lose access to all flows, contacts, and channels immediately.`}
        confirmLabel="Remove Member"
        destructive
        onConfirm={() => {
          if (confirmRemove) handleRemove(confirmRemove.userId);
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
      <ConfirmDialog
        open={!!confirmRevoke}
        title="Revoke Invite"
        message="Are you sure you want to revoke this invitation? The invite link will immediately become invalid."
        confirmLabel="Revoke Invite"
        destructive
        onConfirm={() => {
          if (confirmRevoke) handleRevoke(confirmRevoke);
          setConfirmRevoke(null);
        }}
        onCancel={() => setConfirmRevoke(null)}
      />
    </div>
  );
}
