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
  ChevronRight,
  ArrowRight,
  UserCheck,
  Check,
  RotateCcw,
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
  const [items, setItems] = useState<Broadcast[]>(broadcasts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);

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

  const selectedBroadcast = selectedId
    ? items.find((b) => b.id === selectedId) ?? null
    : null;

  if (isCreatingNew) {
    return (
      <BroadcastWizard
        broadcast={null}
        workspaceId={workspaceId}
        channels={channels}
        onBack={() => setIsCreatingNew(false)}
        onSaved={(created) => {
          setItems((prev) => [created, ...prev]);
          setIsCreatingNew(false);
          setSelectedId(created.id);
        }}
      />
    );
  }

  if (selectedBroadcast) {
    if (selectedBroadcast.status === "draft" || selectedBroadcast.status === "scheduled") {
      return (
        <BroadcastWizard
          broadcast={selectedBroadcast}
          workspaceId={workspaceId}
          channels={channels}
          onBack={() => setSelectedId(null)}
          onSaved={(updated) => {
            setItems((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
          }}
          onDeleted={(id) => {
            setItems((prev) => prev.filter((b) => b.id !== id));
            setSelectedId(null);
          }}
        />
      );
    }

    return (
      <BroadcastReportView
        broadcast={selectedBroadcast}
        workspaceId={workspaceId}
        channels={channels}
        onBack={() => setSelectedId(null)}
        onDeleted={(id) => {
          setItems((prev) => prev.filter((b) => b.id !== id));
          setSelectedId(null);
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
              Send mass announcements and direct marketing campaigns to your audience
            </p>
          </div>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Create Broadcast
          </button>
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="flex-1 overflow-auto p-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <Radio className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-semibold text-foreground">No broadcasts yet</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Create your first broadcast to message your contacts across Instagram, WhatsApp, and Facebook.
            </p>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              New Broadcast Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((broadcast) => {
              const status = statusConfig[broadcast.status];
              const StatusIcon = status.icon;
              const isDraft = broadcast.status === "draft" || broadcast.status === "scheduled";

              return (
                <div
                  key={broadcast.id}
                  onClick={() => setSelectedId(broadcast.id)}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {broadcast.name}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0",
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

                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {(broadcast.message_content as any)?.text || "No message content"}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {broadcast.total_recipients > 0
                        ? `${broadcast.sent}/${broadcast.total_recipients} sent`
                        : "Draft"}
                    </span>
                    <span>{formatDate(broadcast.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Multi-Step Broadcast Wizard ─────────────────────────────────────────────

function BroadcastWizard({
  broadcast,
  workspaceId,
  channels,
  onBack,
  onSaved,
  onDeleted,
}: {
  broadcast: Broadcast | null;
  workspaceId: string;
  channels: Channel[];
  onBack: () => void;
  onSaved: (saved: Broadcast) => void;
  onDeleted?: (id: string) => void;
}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [name, setName] = useState(broadcast?.name || "");
  const [channelId, setChannelId] = useState<string>("all");
  const [targetType, setTargetType] = useState<"all" | "filter">(
    broadcast?.segment_filter ? "filter" : "all"
  );
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>(
    (broadcast?.segment_filter as unknown as SegmentFilter) || createEmptyFilter()
  );
  const [messageText, setMessageText] = useState(
    (broadcast?.message_content as any)?.text || ""
  );

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);

  // Estimate Audience Reach
  const estimateAudience = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);

      if (targetType === "all") {
        const { count } = await query;
        setEstimatedReach(count ?? 0);
      } else {
        const { count } = await query;
        setEstimatedReach(count ?? 0);
      }
    } catch {
      setEstimatedReach(0);
    }
  }, [workspaceId, targetType]);

  useEffect(() => {
    estimateAudience();
  }, [estimateAudience]);

  async function handleSaveDraft(silent = false) {
    if (!name.trim()) {
      setError("Please provide a campaign name");
      return null;
    }

    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const filterToSave = targetType === "filter" ? segmentFilter : null;
      const payload = {
        workspace_id: workspaceId,
        name: name.trim(),
        status: "draft" as BroadcastStatus,
        message_content: { text: messageText.trim() } as unknown as Json,
        segment_filter: filterToSave as unknown as Json,
      };

      let savedBroadcast: Broadcast;

      if (broadcast?.id) {
        const { data, error: err } = await supabase
          .from("broadcasts")
          .update(payload)
          .eq("id", broadcast.id)
          .select()
          .single();
        if (err) throw err;
        savedBroadcast = data;
      } else {
        const { data, error: err } = await supabase
          .from("broadcasts")
          .insert(payload)
          .select()
          .single();
        if (err) throw err;
        savedBroadcast = data;
      }

      if (!silent) {
        setSuccess("Campaign draft saved successfully");
        setTimeout(() => setSuccess(null), 3000);
      }
      onSaved(savedBroadcast);
      return savedBroadcast;
    } catch (err: any) {
      setError(err?.message || "Failed to save draft");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSendBroadcast() {
    if (!messageText.trim()) {
      setError("Please write a message to broadcast");
      setCurrentStep(3);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const saved = await handleSaveDraft(true);
      if (!saved) throw new Error("Could not save campaign before sending");

      const res = await fetch(`/api/v1/broadcasts/${saved.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageContent: { text: messageText.trim() },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send broadcast");

      onSaved({
        ...saved,
        status: "sending",
        total_recipients: data.totalRecipients,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  }

  const steps = [
    { num: 1, title: "Campaign Setup" },
    { num: 2, title: "Audience Target" },
    { num: 3, title: "Message Content" },
    { num: 4, title: "Review & Send" },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Wizard Navigation Bar */}
      <div className="border-b border-border px-8 py-4 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Back to Broadcasts"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {broadcast ? `Edit: ${name || "Untitled Broadcast"}` : "Create New Broadcast"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of 4 • {steps[currentStep - 1].title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Save Draft
            </button>
          </div>
        </div>

        {/* Stepper progress indicator */}
        <div className="mt-4 flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                    currentStep === s.num
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : currentStep > s.num
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline transition-colors",
                    currentStep === s.num
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {s.title}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-3 rounded-full transition-colors",
                    currentStep > idx + 1 ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Content Body */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* STEP 1: Campaign Setup */}
          {currentStep === 1 && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <h3 className="text-base font-semibold">1. Campaign Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Give your broadcast campaign a descriptive name and choose the dispatch channel.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Summer Discount, Product Feature Update"
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground">Sending Channel</label>
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Omnichannel Broadcast (All Connected Channels)</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.display_name || ch.username || ch.platform} ({ch.platform})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Audience Targeting */}
          {currentStep === 2 && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <h3 className="text-base font-semibold">2. Audience Targeting</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose who receives this broadcast. Send to all contacts or narrow down by tags and custom fields.
                </p>
              </div>

              {/* Target options selector */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setTargetType("all")}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 text-left transition-all",
                    targetType === "all"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-border/80 bg-background"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="h-5 w-5 text-primary" />
                    {targetType === "all" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold">All Contacts</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Send to all subscribed contacts in your workspace without filters.
                  </p>
                </div>

                <div
                  onClick={() => setTargetType("filter")}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 text-left transition-all",
                    targetType === "filter"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-border/80 bg-background"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Filter className="h-5 w-5 text-primary" />
                    {targetType === "filter" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold">Target Audience Segment</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Filter by specific tags, custom fields, or interaction history.
                  </p>
                </div>
              </div>

              {/* Segment Filter builder if selected */}
              {targetType === "filter" && (
                <div className="pt-2 border-t border-border/60">
                  <SegmentBuilder
                    value={segmentFilter}
                    onChange={setSegmentFilter}
                    workspaceId={workspaceId}
                  />
                </div>
              )}

              {/* Estimated reach badge */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4 text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Estimated Audience Reach
                </span>
                <span className="font-bold text-sm text-primary">
                  {estimatedReach !== null ? `${estimatedReach} Contacts` : "Calculating..."}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Message Content */}
          {currentStep === 3 && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">3. Message Composer</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Craft your broadcast copy with dynamic personalization tags.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMessageText((prev: string) => `${prev} {{display_name}}`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    + Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev: string) => `${prev} {{email}}`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    + Email
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your broadcast announcement message here..."
                  rows={6}
                  className="w-full rounded-xl border border-input bg-background p-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Supports dynamic personalization tags</span>
                  <span>{messageText.length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Dispatch */}
          {currentStep === 4 && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <h3 className="text-base font-semibold">4. Review & Dispatch</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review your campaign summary before triggering mass delivery.
                </p>
              </div>

              <div className="space-y-4 text-sm divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Campaign Name</span>
                  <span className="font-semibold text-foreground">{name || "Untitled"}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground">Target Audience</span>
                  <span className="font-semibold text-foreground">
                    {targetType === "all" ? "All Workspace Contacts" : "Segment Filtered"} (
                    {estimatedReach} recipients)
                  </span>
                </div>
                <div className="pt-3">
                  <span className="text-muted-foreground block mb-1.5">Message Preview</span>
                  <div className="rounded-xl bg-muted/40 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
                    {messageText || "[No message content provided]"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !name.trim()) {
                      setError("Please provide a campaign name");
                      return;
                    }
                    setError(null);
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={sending || !messageText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? "Dispatching Broadcast..." : "Send Broadcast Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sent Broadcast Delivery Report ──────────────────────────────────────────

function BroadcastReportView({
  broadcast,
  workspaceId,
  channels,
  onBack,
  onDeleted,
}: {
  broadcast: Broadcast;
  workspaceId: string;
  channels: Channel[];
  onBack: () => void;
  onDeleted: (id: string) => void;
}) {
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = statusConfig[broadcast.status];
  const StatusIcon = status.icon;

  useEffect(() => {
    async function loadRecipients() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("broadcast_recipients")
          .select("id, status, sent_at, error_message, contacts(display_name, phone_number, avatar_url)")
          .eq("broadcast_id", broadcast.id)
          .order("sent_at", { ascending: false, nullsFirst: false })
          .limit(100);

        if (data) setRecipients(data as unknown as RecipientRow[]);
      } catch (err) {
        console.warn("Failed to load recipients:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecipients();
  }, [broadcast.id]);

  async function handleDelete() {
    try {
      const res = await fetch(`/api/v1/broadcasts/${broadcast.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(broadcast.id);
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{broadcast.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    status.className
                  )}
                >
                  <StatusIcon className={cn("h-3.5 w-3.5", broadcast.status === "sending" && "animate-spin")} />
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Dispatched {formatDate(broadcast.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{broadcast.total_recipients}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Recipients</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-2xl font-bold text-green-600">{broadcast.sent}</p>
              <p className="text-xs text-muted-foreground mt-1">Delivered</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-2xl font-bold text-red-600">{broadcast.failed}</p>
              <p className="text-xs text-muted-foreground mt-1">Failed</p>
            </div>
          </div>

          {/* Message copy */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Broadcast Content</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-xl">
              {(broadcast.message_content as any)?.text || "No message content recorded"}
            </p>
          </div>

          {/* Delivery Activity Log */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Delivery Activity ({recipients.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recipients.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No recipient delivery rows recorded.</p>
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {recipients.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-3.5 text-xs bg-card hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">
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
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}
                      >
                        {rec.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{formatDate(rec.sent_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Broadcast"
        message="Are you sure you want to delete this broadcast? This action cannot be undone."
        confirmLabel="Delete"
        destructive={true}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
