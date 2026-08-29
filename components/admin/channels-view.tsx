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
} from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { PLATFORMS, PLATFORM_LABELS, platformLabel, type Platform } from "@/lib/platforms";
import { disconnectChannelAdmin } from "@/lib/actions/admin";
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

  async function handleDisconnect(channel: ChannelWithWorkspace) {
    if (!confirm(`Are you sure you want to disconnect channel ${channel.display_name || channel.username}?`)) {
      return;
    }

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

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connected Social Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide inventory of social media channels and external account links.
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
            <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4">Channel / Account</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Zernio Account ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Connected At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No channels matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ch) => (
                  <tr key={ch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {ch.profile_picture ? (
                          <img
                            src={ch.profile_picture}
                            alt={ch.display_name || ch.username || ""}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <PlatformIcon platform={ch.platform as Platform} className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {ch.display_name || ch.username || "Account"}
                          </p>
                          {ch.username && (
                            <p className="text-[11px] text-muted-foreground">@{ch.username}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <PlatformIcon platform={ch.platform as Platform} className="h-3.5 w-3.5" />
                        {platformLabel(ch.platform)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {ch.workspaces?.name || "Workspace"}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {ch.zernio_account_id || ch.late_account_id}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ch.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            ch.is_active ? "bg-green-500" : "bg-muted-foreground"
                          }`}
                        />
                        {ch.is_active ? "Active" : "Disconnected"}
                      </span>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {new Date(ch.connected_at || ch.created_at).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="p-4 text-right">
                      {ch.is_active && (
                        <button
                          onClick={() => handleDisconnect(ch)}
                          disabled={loadingId === ch.id}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 disabled:opacity-50 transition-colors"
                          title="Disconnect channel from workspace"
                        >
                          {loadingId === ch.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <PowerOff className="h-3 w-3" /> Disconnect
                            </>
                          )}
                        </button>
                      )}
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
