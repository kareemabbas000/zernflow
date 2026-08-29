"use client";

import { useState } from "react";
import {
  Search,
  Plug,
  Building2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PowerOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORMS, PLATFORM_LABELS, platformLabel, type Platform } from "@/lib/platforms";
import {
  disconnectChannelAdmin,
  deleteChannelAdmin,
  syncAllPlatformChannelsAdmin,
} from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Channel } from "@/lib/admin";

interface ChannelWithWorkspace extends Channel {
  workspaces?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function AdminChannelsView({ initialChannels }: { initialChannels: ChannelWithWorkspace[] }) {
  const [channels, setChannels] = useState<ChannelWithWorkspace[]>(initialChannels);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<ChannelWithWorkspace | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = channels.filter((c) => {
    const matchesSearch =
      (c.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.zernio_account_id || c.late_account_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.workspaces?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.is_active) ||
      (statusFilter === "inactive" && !c.is_active);

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  async function handleSyncAll() {
    setSyncingAll(true);
    setFeedback(null);

    const res = await syncAllPlatformChannelsAdmin();

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({
        message: `Zernio Reconcile Complete: Scanned ${res.totalZernioAccounts} live accounts (${res.updated} updated, ${res.disconnected} pruned/disconnected).`,
        type: "success",
      });
      // Refresh page data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    setSyncingAll(false);
    setTimeout(() => setFeedback(null), 5000);
  }

  async function handleDisconnect(channel: ChannelWithWorkspace) {
    setLoadingId(channel.id);
    setFeedback(null);

    const res = await disconnectChannelAdmin(channel.id);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channel.id
            ? { ...c, is_active: false, status: "disconnected", disconnected_at: new Date().toISOString() }
            : c
        )
      );
      setFeedback({
        message: `Channel disconnected successfully`,
        type: "success",
      });
    }
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleDeleteChannel() {
    if (!channelToDelete) return;
    setLoadingId(channelToDelete.id);
    setFeedback(null);

    const res = await deleteChannelAdmin(channelToDelete.id);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setChannels((prev) => prev.filter((c) => c.id !== channelToDelete.id));
      setFeedback({
        message: `Channel ${channelToDelete.display_name || channelToDelete.username} permanently deleted.`,
        type: "success",
      });
    }
    setChannelToDelete(null);
    setLoadingId(null);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connected Social Channels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-tenant channel registry with direct Zernio two-way mirror sync and root controls.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {syncingAll ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Reconcile with Zernio
        </button>
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
            placeholder="Search by account name, username, Zernio ID, or workspace..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Disconnected</option>
          </select>
        </div>
      </div>

      {/* Channels Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-4">Channel & Handle</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Status</th>
                <th className="p-4">Zernio Account ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No channels matching search criteria
                  </td>
                </tr>
              ) : (
                filtered.map((ch) => {
                  const accountId = ch.zernio_account_id || ch.late_account_id;
                  return (
                    <tr key={ch.id} className="hover:bg-muted/30 transition-colors">
                      {/* Channel */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {ch.profile_picture ? (
                            <img
                              src={ch.profile_picture}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                              {ch.platform[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground">
                              {ch.display_name || ch.username || "Unnamed Channel"}
                            </div>
                            {ch.username && (
                              <div className="text-muted-foreground text-[11px]">
                                @{ch.username.replace(/^@/, "")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium">
                          <PlatformIcon platform={ch.platform as Platform} className="h-3.5 w-3.5" />
                          {platformLabel(ch.platform as Platform)}
                        </span>
                      </td>

                      {/* Workspace */}
                      <td className="p-4">
                        {ch.workspaces ? (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {ch.workspaces.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Unlinked</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            ch.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ch.is_active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <PowerOff className="h-3 w-3" />
                          )}
                          {ch.is_active ? "Connected" : "Disconnected"}
                        </span>
                      </td>

                      {/* Account ID */}
                      <td className="p-4 font-mono text-[11px] text-muted-foreground">
                        {accountId ? (
                          <span className="rounded bg-muted px-1.5 py-0.5">{accountId}</span>
                        ) : (
                          <span className="text-amber-500 italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ch.is_active && (
                            <button
                              onClick={() => handleDisconnect(ch)}
                              disabled={loadingId === ch.id}
                              className="p-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 transition-colors"
                              title="Disconnect Channel"
                            >
                              {loadingId === ch.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <PowerOff className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setChannelToDelete(ch)}
                            disabled={loadingId === ch.id}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 transition-colors"
                            title="Delete Channel Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Delete Channel Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(channelToDelete)}
        title="Delete Channel Record"
        message={`Are you sure you want to permanently delete the channel record for "${channelToDelete?.display_name || channelToDelete?.username}"?`}
        confirmLabel="Delete Channel"
        destructive={true}
        onCancel={() => setChannelToDelete(null)}
        onConfirm={handleDeleteChannel}
      />
    </div>
  );
}
