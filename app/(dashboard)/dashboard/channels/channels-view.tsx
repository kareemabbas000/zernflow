"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  Copy,
  Plug,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Loader2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  Phone,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PlatformIcon } from "@/components/platform-icon";
import type { Database } from "@/lib/types/database";
import {
  PLATFORMS,
  PLATFORM_DETAILS,
  PLATFORM_LABELS,
  platformLabel,
  type Platform,
} from "@/lib/platforms";

type Channel = Database["public"]["Tables"]["channels"]["Row"];

function getDmLink(platform: Platform, username: string | null): { url: string | null; label: string } {
  const handle = username || "";
  switch (platform) {
    case "instagram":
      return handle ? { url: `https://ig.me/m/${handle.replace(/^@/, "")}`, label: `ig.me/m/${handle.replace(/^@/, "")}` } : { url: null, label: "" };
    case "facebook":
      return handle ? { url: `https://m.me/${handle.replace(/^@/, "")}`, label: `m.me/${handle.replace(/^@/, "")}` } : { url: null, label: "" };
    case "telegram":
      return handle ? { url: `https://t.me/${handle.replace(/^@/, "")}`, label: `t.me/${handle.replace(/^@/, "")}` } : { url: null, label: "" };
    case "twitter":
      return handle ? { url: `https://x.com/${handle.replace(/^@/, "")}`, label: `x.com/${handle.replace(/^@/, "")}` } : { url: null, label: "" };
    case "reddit":
      return handle ? { url: `https://reddit.com/message/compose/?to=${handle.replace(/^@/, "")}`, label: `reddit.com/.../to=${handle}` } : { url: null, label: "" };
    case "whatsapp": {
      const digits = handle.replace(/\D/g, "");
      return digits ? { url: `https://wa.me/${digits}`, label: `wa.me/${digits}` } : { url: null, label: "" };
    }
    default:
      return { url: null, label: "" };
  }
}

export function ChannelsView({
  channels: initialChannels,
  workspaceId,
}: {
  channels: Channel[];
  workspaceId: string;
}) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time synchronization for channels
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function refreshChannels() {
      try {
        const { data } = await supabase
          .from("channels")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });
        if (isMounted && data) {
          setChannels(data);
        }
      } catch (err) {
        console.warn("Channels auto-refresh error:", err);
      }
    }

    const channel = supabase
      .channel(`channels-live-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          refreshChannels();
        }
      )
      .subscribe();

    const interval = setInterval(refreshChannels, 4000);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [workspaceId]);

  // Telegram In-App Setup Wizard State
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramTargetType, setTelegramTargetType] = useState<"channel" | "group">("channel");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramCode, setTelegramCode] = useState<string | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = useState("ZernioScheduleBot");
  const [telegramPolling, setTelegramPolling] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [copiedBot, setCopiedBot] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [directChatId, setDirectChatId] = useState("");
  const [directConnecting, setDirectConnecting] = useState(false);
  const [isAdvancedChatId, setIsAdvancedChatId] = useState(false);

  // WhatsApp Guided Setup Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Initiate Connect
  async function handleConnect(platform: Platform) {
    if (platform === "telegram") {
      openTelegramWizard();
      return;
    }

    if (platform === "whatsapp") {
      setShowWhatsAppModal(true);
      return;
    }

    setConnecting(platform);
    try {
      const res = await fetch("/api/v1/channels/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSyncMessage(data.error || "Failed to start connection");
        setTimeout(() => setSyncMessage(null), 4000);
        return;
      }

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setSyncMessage("Failed to initiate connection. Please check your network.");
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setConnecting(null);
    }
  }

  // Launch WhatsApp OAuth directly from Guided Wizard
  async function handleLaunchWhatsAppOAuth() {
    setShowWhatsAppModal(false);
    setConnecting("whatsapp");
    try {
      const res = await fetch("/api/v1/channels/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "whatsapp" }),
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setSyncMessage(data.error || "Failed to initiate WhatsApp setup.");
      }
    } catch {
      setSyncMessage("Failed to initiate WhatsApp connection.");
    } finally {
      setConnecting(null);
    }
  }

  // Telegram Wizard Lifecycle
  async function openTelegramWizard() {
    setShowTelegramModal(true);
    setTelegramLoading(true);
    setTelegramError(null);
    setTelegramConnected(false);
    setTelegramCode(null);

    try {
      const res = await fetch("/api/v1/channels/telegram/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setTelegramError(data.error || "Failed to generate Telegram access code.");
        setTelegramLoading(false);
        return;
      }

      setTelegramCode(data.code);
      if (data.botUsername) setTelegramBotUsername(data.botUsername);
      setTelegramLoading(false);
      setTelegramPolling(true);
    } catch {
      setTelegramError("Failed to communicate with setup server.");
      setTelegramLoading(false);
    }
  }

  // Real-time polling for Telegram Access Code
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (showTelegramModal && telegramPolling && telegramCode && !telegramConnected) {
      timer = setInterval(async () => {
        try {
          const res = await fetch("/api/v1/channels/telegram/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: telegramCode }),
          });
          const data = await res.json();

          if (data.connected && data.channel) {
            setTelegramConnected(true);
            setTelegramPolling(false);
            setChannels((prev) => [data.channel, ...prev.filter((c) => c.id !== data.channel.id)]);
            setTimeout(() => {
              setShowTelegramModal(false);
              setTelegramConnected(false);
            }, 2500);
          } else if (data.status === "expired") {
            setTelegramPolling(false);
            setTelegramError("Access code expired. Please generate a new code.");
          }
        } catch (err) {
          console.warn("Telegram poll error:", err);
        }
      }, 3000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showTelegramModal, telegramPolling, telegramCode, telegramConnected]);

  // Connect Telegram Direct Chat ID
  async function handleConnectDirectTelegram() {
    if (!directChatId.trim()) return;
    setDirectConnecting(true);
    setTelegramError(null);

    try {
      const res = await fetch("/api/v1/channels/telegram/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: directChatId.trim() }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setTelegramError(data.error || "Failed to connect Telegram chat.");
        return;
      }

      if (data.channel) {
        setChannels((prev) => [data.channel, ...prev.filter((c) => c.id !== data.channel.id)]);
        setTelegramConnected(true);
        setTimeout(() => {
          setShowTelegramModal(false);
          setTelegramConnected(false);
          setDirectChatId("");
        }, 1800);
      }
    } catch {
      setTelegramError("Direct connection failed.");
    } finally {
      setDirectConnecting(false);
    }
  }

  // Sync Channels
  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch("/api/v1/channels/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSyncMessage(data.error || "Sync failed");
        return;
      }

      const syncedChannels: Channel[] = data.channels ?? [];
      setChannels(syncedChannels);
      setSyncMessage("All channels synchronized");
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage("Failed to sync channels.");
    } finally {
      setSyncing(false);
    }
  }

  // Toggle Active
  async function handleToggleActive(channel: Channel) {
    setTogglingId(channel.id);
    const supabase = createClient();

    const { error } = await supabase
      .from("channels")
      .update({ is_active: !channel.is_active })
      .eq("id", channel.id);

    if (!error) {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channel.id ? { ...c, is_active: !c.is_active } : c
        )
      );
    }
    setTogglingId(null);
  }

  // Delete Channel
  async function handleDelete() {
    if (!channelToDelete) return;
    const id = channelToDelete.id;
    setChannelToDelete(null);
    setDeletingId(id);

    try {
      const res = await fetch(`/api/v1/channels/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSyncMessage(data.error || "Failed to disconnect channel");
        setTimeout(() => setSyncMessage(null), 4000);
        return;
      }

      setChannels((prev) => prev.filter((c) => c.id !== id));
      setSyncMessage("Channel disconnected");
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage("Failed to disconnect channel.");
    } finally {
      setDeletingId(null);
      setChannelToDelete(null);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-8 p-6 sm:p-8 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Connect Your Channels
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect the communication channels where your customers message you. Automate DMs, broadcasts, and AI interactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {syncMessage && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
              {syncMessage}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin text-primary")} />
            {syncing ? "Syncing..." : "Sync Status"}
          </button>
        </div>
      </div>

      {/* SECTION 1: Connected Channels List */}
      {channels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>Connected Accounts</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {channels.length}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Active integrations communicating with your workspace
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => {
              const label = platformLabel(channel.platform);
              const meta = PLATFORM_DETAILS[channel.platform as Platform];
              const dm = getDmLink(channel.platform as Platform, channel.username);

              return (
                <div
                  key={channel.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30 hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar + Names + Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Profile Picture with Platform Badge */}
                        <div className="relative shrink-0">
                          {channel.profile_picture ? (
                            <img
                              src={channel.profile_picture}
                              alt={channel.display_name || label}
                              className="h-12 w-12 rounded-xl object-cover border border-border shadow-xs"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border font-bold text-muted-foreground">
                              <PlatformIcon platform={channel.platform} className="h-6 w-6" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-background shadow-xs">
                            <PlatformIcon platform={channel.platform} className="h-3 w-3" size={12} />
                          </div>
                        </div>

                        {/* Name & Handle */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm truncate text-foreground">
                            {channel.display_name || channel.username || label}
                          </h4>
                          {channel.username && (
                            <p className="text-xs text-muted-foreground truncate">
                              {channel.platform === "whatsapp" ? channel.username : `@${channel.username.replace(/^@/, "")}`}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", meta?.badgeColor || "bg-muted text-muted-foreground")}>
                              {label}
                            </span>
                            <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", channel.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", channel.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
                              {channel.is_active ? "Connected" : "Paused"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(channel)}
                          disabled={togglingId === channel.id}
                          className={cn(
                            "rounded-lg p-1.5 transition-colors",
                            channel.is_active
                              ? "text-emerald-600 hover:bg-emerald-500/10"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          title={channel.is_active ? "Pause channel messages" : "Activate channel messages"}
                        >
                          {channel.is_active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setChannelToDelete(channel)}
                          disabled={deletingId === channel.id}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Disconnect account"
                        >
                          {deletingId === channel.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* DM Link snippet if available */}
                    {dm.url && (
                      <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-muted/40 border border-border/60 p-1.5 text-xs">
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground px-1">
                          {dm.label}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(dm.url!);
                            setCopiedId(channel.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === channel.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                    <Link
                      href={`/dashboard/inbox`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Open Inbox
                    </Link>

                    <Link
                      href={`/dashboard/flows`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <span>Automate</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Add New Channels Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {channels.length === 0 ? "Choose a Channel to Connect" : "Connect Additional Channels"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Select the platform you would like to link with your workspace.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platformKey) => {
            const meta = PLATFORM_DETAILS[platformKey];
            const isConnecting = connecting === platformKey;
            const connectedCount = channels.filter((c) => c.platform === platformKey).length;

            return (
              <div
                key={platformKey}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  {/* Top Bar: Icon + Popular Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border shadow-xs group-hover:scale-105 transition-transform">
                      <PlatformIcon platform={platformKey} className="h-6 w-6" size={24} />
                    </div>

                    {connectedCount > 0 ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                        {connectedCount} Connected
                      </span>
                    ) : meta?.isPopular ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
                    {meta.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>

                  {/* Capability Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {meta.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        ✓ {cap.replace("_", " ")}
                      </span>
                    ))}
                    {meta.capabilities.length > 3 && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        +{meta.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Connect Action Button */}
                <div className="mt-6 border-t border-border pt-4">
                  <button
                    onClick={() => handleConnect(platformKey)}
                    disabled={isConnecting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-all shadow-sm shadow-primary/20"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        {connectedCount > 0 ? `Connect Another ${meta.shortName}` : `Connect ${meta.shortName}`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TELEGRAM SETUP WIZARD MODAL (100% In-App) */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <PlatformIcon platform="telegram" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Connect Telegram</h3>
                  <p className="text-xs text-muted-foreground">
                    Add our integration bot to your Telegram channel or group.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTelegramModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {telegramError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {telegramError}
              </div>
            )}

            {/* Success State */}
            {telegramConnected ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check className="h-8 w-8" />
                </div>
                <h4 className="mt-3 text-lg font-bold text-foreground">Telegram Connected!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your channel is linked and ready for messaging and automation.
                </p>
              </div>
            ) : telegramLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">Generating connection code...</p>
              </div>
            ) : isAdvancedChatId ? (
              /* Advanced Direct Chat ID Form */
              <div className="py-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Telegram Chat ID / Username</label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Enter the channel username (e.g. <span className="font-mono">@mychannel</span>) or numeric Chat ID. The integration bot must already be an admin.
                  </p>
                  <input
                    type="text"
                    placeholder="@mychannel or -100123456789"
                    value={directChatId}
                    onChange={(e) => setDirectChatId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    onClick={() => setIsAdvancedChatId(false)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    ← Back to Access Code flow
                  </button>

                  <button
                    onClick={handleConnectDirectTelegram}
                    disabled={!directChatId.trim() || directConnecting}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {directConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Chat ID"}
                  </button>
                </div>
              </div>
            ) : (
              /* 4-Step Access Code Flow */
              <div className="py-5 space-y-4">
                {/* Step 1: Add Bot */}
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 1: Add Integration Bot</span>
                    <span className="text-[11px] text-muted-foreground">Administrator Access</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Open your Telegram channel/group settings and add the bot as an administrator:
                  </p>
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border bg-background p-2 px-3">
                    <span className="font-mono font-semibold text-xs text-foreground">@{telegramBotUsername}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`@${telegramBotUsername}`);
                        setCopiedBot(true);
                        setTimeout(() => setCopiedBot(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {copiedBot ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedBot ? "Copied" : "Copy Bot"}
                    </button>
                  </div>
                </div>

                {/* Step 2: Send Connection Code */}
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 2: Send Link Code</span>
                    <span className="text-[11px] text-amber-500 font-medium">Valid for 15 mins</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Send this message into your channel or directly to the bot:
                  </p>
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border bg-background p-2.5 px-3">
                    <span className="font-mono font-bold text-sm text-primary tracking-wide">{telegramCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(telegramCode || "");
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                </div>

                {/* Step 3: Polling Liveness Indicator */}
                <div className="flex items-center justify-between rounded-xl bg-sky-500/5 border border-sky-500/20 p-3.5 text-xs text-sky-600 dark:text-sky-400">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Listening for bot connection in your Telegram channel...</span>
                  </div>
                  <a
                    href={`https://t.me/${telegramBotUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold hover:underline shrink-0"
                  >
                    Open Telegram <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    onClick={() => setIsAdvancedChatId(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Advanced: Connect with Chat ID
                  </button>

                  <button
                    onClick={() => setShowTelegramModal(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP GUIDED SETUP MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <PlatformIcon platform="whatsapp" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Connect WhatsApp Business</h3>
                  <p className="text-xs text-muted-foreground">
                    Connect your WhatsApp Business Account (WABA) number
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Meta Business Login</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Log in to your Meta account to access or create your WhatsApp Business Account (WABA).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Choose Phone Number</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Select the verified phone number your customers will message in this workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">Ready for Inbox & AI Automations</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Your number connects instantly for real-time customer messaging, flows, and AI agents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border">
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLaunchWhatsAppOAuth}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Continue with Meta Login
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        open={!!channelToDelete}
        title="Disconnect Social Channel?"
        message={`This will unlink ${
          channelToDelete?.display_name ||
          channelToDelete?.username ||
          (channelToDelete ? platformLabel(channelToDelete.platform) : "this channel")
        } from this workspace. Inbound messages and automation flows for this account will stop receiving events.`}
        confirmLabel="Disconnect"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setChannelToDelete(null)}
      />
    </div>
  );
}
