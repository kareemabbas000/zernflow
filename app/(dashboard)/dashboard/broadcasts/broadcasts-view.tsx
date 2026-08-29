"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Radio,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  XCircle,
  FileEdit,
  Calendar,
  Filter,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  Trash2,
  Users,
  Plug,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PlatformIcon } from "@/components/platform-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  SegmentBuilder,
  createEmptyFilter,
  type SegmentFilter,
} from "@/components/segment-builder";
import type { Database, BroadcastStatus, Json, Platform } from "@/lib/types/database";

type Broadcast = Database["public"]["Tables"]["broadcasts"]["Row"];
type Channel = Database["public"]["Tables"]["channels"]["Row"];

interface RecipientRow {
  id: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  contacts: {
    display_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
}

const statusConfig: Record<
  BroadcastStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-muted text-muted-foreground",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  sending: {
    label: "Sending",
    icon: Loader2,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not scheduled";
  return new Date(dateStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BroadcastsView({
  broadcasts,
  workspaceId,
}: {
  broadcasts: Broadcast[];
  workspaceId: string;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [items, setItems] = useState(broadcasts);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("all");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>(createEmptyFilter());
  const [showSegmentFilter, setShowSegmentFilter] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchingContactsCount, setMatchingContactsCount] = useState<number | null>(null);

  // Load connected channels
  useEffect(() => {
    async function loadChannels() {
      const supabase = createClient();
      const { data } = await supabase
        .from("channels")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true);
      if (data) setChannels(data);
    }
    loadChannels();
  }, [workspaceId]);

  // Estimate audience count
  const estimateAudience = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    const { count } = await query;
    setMatchingContactsCount(count ?? 0);
  }, [workspaceId]);

  useEffect(() => {
    estimateAudience();
  }, [estimateAudience]);

  async function handleCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true);

    try {
      const supabase = createClient();
      const filterToSave = showSegmentFilter ? segmentFilter : null;
      const { data, error } = await supabase
        .from("broadcasts")
        .insert({
          workspace_id: workspaceId,
          name: newName.trim(),
          status: "draft",
          message_content: { text: "" },
          segment_filter: filterToSave as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setItems((prev) => [data, ...prev]);
        setNewName("");
        setShowCreate(false);
        setSelectedId(data.id);
      }
    } catch (err) {
      console.error("Failed to create broadcast:", err);
    } finally {
      setCreating(false);
    }
  }

  const selectedBroadcast = selectedId
    ? items.find((b) => b.id === selectedId) ?? null
    : null;

  if (selectedBroadcast) {
    return (
      <BroadcastDetail
        broadcast={selectedBroadcast}
        workspaceId={workspaceId}
        channels={channels}
        onBack={() => setSelectedId(null)}
        onDeleted={(id) => {
          setItems((prev) => prev.filter((b) => b.id !== id));
          setSelectedId(null);
        }}
        onUpdate={(updated) => {
          setItems((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              Broadcasts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Send mass messages and direct announcements to your omnichannel contacts
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Create Broadcast
          </button>
        </div>

        {/* Create Broadcast Modal */}
        {showCreate && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold">New Broadcast Campaign</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure campaign targeting and messaging options.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Broadcast Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Summer Promo, Product Launch, System Notice"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              {/* Target Channel Selection */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Sending Channel
                </label>
                <select
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Connected Channels (Workspace-wide)</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.display_name || ch.username || ch.platform} ({ch.platform})
                    </option>
                  ))}
                </select>
              </div>

              {/* Audience Preview */}
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3.5 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Estimated Reach
                </span>
                <span className="font-semibold text-foreground">
                  {matchingContactsCount !== null ? `${matchingContactsCount} Contacts` : "Calculating..."}
                </span>
              </div>

              {/* Targeting Filter Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSegmentFilter(!showSegmentFilter)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    showSegmentFilter
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Target Specific Audience Segment
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      showSegmentFilter && "rotate-180"
                    )}
                  />
                </button>

                {showSegmentFilter && (
                  <div className="mt-3">
                    <SegmentBuilder
                      value={segmentFilter}
                      onChange={setSegmentFilter}
                      workspaceId={workspaceId}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-input px-3.5 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Continue to Composer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Broadcasts List */}
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Radio className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No broadcasts created yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Create a broadcast to message multiple contacts across Instagram, WhatsApp, and Facebook.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((broadcast) => {
              const status = statusConfig[broadcast.status];
              const StatusIcon = status.icon;
              const total = broadcast.total_recipients;

              return (
                <button
                  key={broadcast.id}
                  onClick={() => setSelectedId(broadcast.id)}
                  className="flex w-full items-center gap-6 px-8 py-4 text-left transition-colors hover:bg-accent/50"
                >
                  {/* Status + Name */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-sm font-medium">
                        {broadcast.name}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          status.className
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            broadcast.status === "sending" && "animate-spin"
                          )}
                        />
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {broadcast.scheduled_for
                          ? formatDate(broadcast.scheduled_for)
                          : "Immediate"}
                      </span>
                      <span>
                        Created {formatDate(broadcast.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{total}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Recipients
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {broadcast.sent}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Sent
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">
                        {broadcast.failed}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Failed
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BroadcastDetail({
  broadcast,
  workspaceId,
  channels,
  onBack,
  onUpdate,
  onDeleted,
}: {
  broadcast: Broadcast;
  workspaceId: string;
  channels: Channel[];
  onBack: () => void;
  onUpdate: (updated: Broadcast) => void;
  onDeleted: (id: string) => void;
}) {
  const messageContent = broadcast.message_content as { text?: string } | null;
  const [messageText, setMessageText] = useState(messageContent?.text || "");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const isDraft = broadcast.status === "draft" || broadcast.status === "scheduled";
  const status = statusConfig[broadcast.status];
  const StatusIcon = status.icon;

  // Load recipient delivery rows
  useEffect(() => {
    async function loadRecipients() {
      setLoadingRecipients(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("broadcast_recipients")
          .select("id, status, sent_at, error_message, contacts(display_name, phone_number, avatar_url)")
          .eq("broadcast_id", broadcast.id)
          .order("sent_at", { ascending: false, nullsFirst: false })
          .limit(50);

        if (data) setRecipients(data as unknown as RecipientRow[]);
      } catch (err) {
        console.warn("Failed to load recipients:", err);
      } finally {
        setLoadingRecipients(false);
      }
    }

    if (broadcast.status !== "draft") {
      loadRecipients();
    }
  }, [broadcast.id, broadcast.status]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const newContent = { text: messageText.trim() };
      const { data, error: err } = await supabase
        .from("broadcasts")
        .update({ message_content: newContent as unknown as Json })
        .eq("id", broadcast.id)
        .select()
        .single();

      if (err) throw err;
      if (data) {
        onUpdate(data);
        setSuccess("Draft saved successfully");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!messageText.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/broadcasts/${broadcast.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageContent: { text: messageText.trim() },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send broadcast");
      }

      setSuccess(`Dispatched to ${data.totalRecipients} recipients`);

      onUpdate({
        ...broadcast,
        status: "sending",
        total_recipients: data.totalRecipients,
        message_content: { text: messageText.trim() } as unknown as Json,
      });

      // Poll for completion
      setTimeout(async () => {
        const supabase = createClient();
        const { data: updated } = await supabase
          .from("broadcasts")
          .select("*")
          .eq("id", broadcast.id)
          .single();
        if (updated) onUpdate(updated);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/broadcasts/${broadcast.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete broadcast");
      onDeleted(broadcast.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{broadcast.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    status.className
                  )}
                >
                  <StatusIcon
                    className={cn(
                      "h-3.5 w-3.5",
                      broadcast.status === "sending" && "animate-spin"
                    )}
                  />
                  {status.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Created {formatDate(broadcast.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Stats row */}
          {broadcast.total_recipients > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{broadcast.total_recipients}</p>
                <p className="text-xs text-muted-foreground">Total Recipients</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{broadcast.sent}</p>
                <p className="text-xs text-muted-foreground">Delivered / Sent</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{broadcast.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          )}

          {/* Message composer */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Message Content
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMessageText((prev) => `${prev} {{display_name}}`)}
                  disabled={!isDraft}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  + Name
                </button>
              </div>
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={!isDraft}
              placeholder="Type your broadcast message here..."
              rows={5}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />

            {isDraft && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Supports dynamic variable placeholders</span>
                <span>{messageText.length} characters</span>
              </div>
            )}

            {/* Error/Success messages */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}

            {/* Actions */}
            {isDraft && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSend}
                  disabled={sending || !messageText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Dispatching..." : "Send Broadcast Now"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !messageText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
              </div>
            )}
          </div>

          {/* Delivery Log Table for non-drafts */}
          {broadcast.status !== "draft" && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Recipient Delivery Activity
              </h3>

              {loadingRecipients ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : recipients.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recipient records found.</p>
              ) : (
                <div className="divide-y divide-border overflow-hidden rounded-lg border">
                  {recipients.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <p className="font-medium text-foreground">
                          {rec.contacts?.display_name || rec.contacts?.phone_number || "Contact"}
                        </p>
                        {rec.error_message && (
                          <p className="text-[11px] text-red-500 mt-0.5">{rec.error_message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                            rec.status === "sent"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : rec.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {rec.status}
                        </span>
                        <span className="text-muted-foreground">
                          {rec.sent_at ? formatDate(rec.sent_at) : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Broadcast"
        message="Are you sure you want to delete this broadcast campaign? This action cannot be undone."
        confirmLabel="Delete"
        destructive={true}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
