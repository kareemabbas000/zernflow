"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  GitBranch,
  Users,
  Send,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  Activity,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

type TimeRange = "7d" | "30d" | "90d" | "custom";

interface Stats {
  totalFlows: number;
  totalContacts: number;
  messagesSent: number;
  messagesFailed: number;
}

interface FlowPerformance {
  id: string;
  name: string;
  starts: number;
  completions: number;
  dropOffRate: number;
}

interface DailyCount {
  date: string;
  count: number;
}

interface DailyMessages {
  date: string;
  sent: number;
  failed: number;
}

interface AnalyticsData {
  stats: Stats;
  flowPerformance: FlowPerformance[];
  contactGrowth: DailyCount[];
  messageVolume: DailyMessages[];
}

// --- Helpers ---

function getDateRange(range: TimeRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Simple bar chart with tooltip ---

function MiniBarChart({
  data,
  labels,
  maxVal,
  color,
}: {
  data: number[];
  labels?: string[];
  maxVal: number;
  color: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const safeMax = maxVal || 1;
  return (
    <div className="relative flex items-end gap-1 h-32 mt-4 px-2">
      {data.map((val, i) => (
        <div
          key={i}
          className="group relative h-full flex-1 flex items-end cursor-pointer"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(val / safeMax) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
            className={cn(
              "w-full rounded-t-md min-h-[4px] transition-all duration-300",
              color,
              hovered !== null && hovered !== i && "opacity-30 scale-y-95",
              hovered === i && "shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] brightness-125"
            )}
          />
          {hovered === i && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 whitespace-nowrap rounded-xl bg-foreground/95 backdrop-blur-md px-3 py-2 text-xs text-background shadow-2xl pointer-events-none">
              <p className="font-bold text-sm">{val} new</p>
              {labels?.[i] && <p className="text-background/70 font-medium">{labels[i]}</p>}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground/95" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Stacked bar chart for message volume ---

function MessageVolumeChart({
  data,
  maxVal,
}: {
  data: DailyMessages[];
  maxVal: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const safeMax = maxVal || 1;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex items-end gap-1 h-32 mt-4 px-2">
        {data.map((d, i) => {
          const sentPct = (d.sent / safeMax) * 100;
          const failedPct = (d.failed / safeMax) * 100;
          return (
            <div
              key={i}
              className="relative h-full flex flex-1 flex-col items-stretch justify-end cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {failedPct > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${failedPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  className={cn(
                    "bg-rose-500 rounded-t-sm min-h-[2px] transition-all duration-300",
                    hovered !== null && hovered !== i && "opacity-30",
                    hovered === i && "brightness-110 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  )}
                />
              )}
              {sentPct > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${sentPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                  className={cn(
                    "bg-emerald-500 min-h-[2px] transition-all duration-300",
                    failedPct === 0 && "rounded-t-sm",
                    hovered !== null && hovered !== i && "opacity-30",
                    hovered === i && "brightness-110 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  )}
                />
              )}
              {hovered === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 whitespace-nowrap rounded-xl bg-foreground/95 backdrop-blur-md px-3 py-2 text-xs text-background shadow-2xl pointer-events-none">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm text-emerald-400">{d.sent} sent</p>
                    {d.failed > 0 && <p className="font-bold text-sm text-rose-400">{d.failed} failed</p>}
                  </div>
                  <p className="text-background/70 font-medium mt-1 pt-1 border-t border-background/20">{formatShortDate(d.date)}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground/95" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between text-xs font-semibold text-muted-foreground px-2">
        <span>{formatShortDate(data[0].date)}</span>
        <span>{formatShortDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

// --- Main component ---

export function AnalyticsView({
  workspaceId,
  initialData,
}: {
  workspaceId: string;
  initialData: AnalyticsData;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<Stats>(initialData.stats);
  const [flowPerformance, setFlowPerformance] = useState<FlowPerformance[]>(initialData.flowPerformance);
  const [contactGrowth, setContactGrowth] = useState<DailyCount[]>(initialData.contactGrowth);
  const [messageVolume, setMessageVolume] = useState<DailyMessages[]>(initialData.messageVolume);

  // Only refetch when user changes time range away from the default 30d
  useEffect(() => {
    if (timeRange === "30d") {
      // Reset to server-provided data
      setStats(initialData.stats);
      setFlowPerformance(initialData.flowPerformance);
      setContactGrowth(initialData.contactGrowth);
      setMessageVolume(initialData.messageVolume);
      return;
    }
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    setLoading(true);
    const supabase = createClient();

    const range =
      timeRange === "custom" && customStart && customEnd
        ? { start: new Date(customStart).toISOString(), end: new Date(customEnd).toISOString() }
        : getDateRange(timeRange);

    try {
      const [flowsRes, contactsRes, sentRes, failedRes, startsRes, completionsRes, flowsListRes, contactEvents, msgEvents] = await Promise.all([
        supabase
          .from("flows")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),
        supabase
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId),
        supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("event_type", "message_sent")
          .gte("created_at", range.start)
          .lte("created_at", range.end),
        supabase
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("event_type", "message_failed")
          .gte("created_at", range.start)
          .lte("created_at", range.end),
        supabase
          .from("analytics_events")
          .select("flow_id")
          .eq("workspace_id", workspaceId)
          .eq("event_type", "flow_started")
          .gte("created_at", range.start)
          .lte("created_at", range.end)
          .not("flow_id", "is", null),
        supabase
          .from("analytics_events")
          .select("flow_id")
          .eq("workspace_id", workspaceId)
          .eq("event_type", "flow_completed")
          .gte("created_at", range.start)
          .lte("created_at", range.end)
          .not("flow_id", "is", null),
        supabase
          .from("flows")
          .select("id, name")
          .eq("workspace_id", workspaceId),
        supabase
          .from("contacts")
          .select("created_at")
          .eq("workspace_id", workspaceId)
          .gte("created_at", range.start)
          .lte("created_at", range.end)
          .order("created_at"),
        supabase
          .from("analytics_events")
          .select("event_type, created_at")
          .eq("workspace_id", workspaceId)
          .in("event_type", ["message_sent", "message_failed"])
          .gte("created_at", range.start)
          .lte("created_at", range.end)
          .order("created_at"),
      ]);

      setStats({
        totalFlows: flowsRes.count ?? 0,
        totalContacts: contactsRes.count ?? 0,
        messagesSent: sentRes.count ?? 0,
        messagesFailed: failedRes.count ?? 0,
      });

      // Flow performance
      const flowNames = new Map(
        (flowsListRes.data ?? []).map((f) => [f.id, f.name])
      );
      const startCounts = new Map<string, number>();
      (startsRes.data ?? []).forEach((e) => {
        if (e.flow_id) startCounts.set(e.flow_id, (startCounts.get(e.flow_id) ?? 0) + 1);
      });
      const completionCounts = new Map<string, number>();
      (completionsRes.data ?? []).forEach((e) => {
        if (e.flow_id) completionCounts.set(e.flow_id, (completionCounts.get(e.flow_id) ?? 0) + 1);
      });
      const allFlowIds = new Set([...startCounts.keys(), ...completionCounts.keys()]);
      const perfData: FlowPerformance[] = Array.from(allFlowIds)
        .map((fid) => {
          const starts = startCounts.get(fid) ?? 0;
          const completions = completionCounts.get(fid) ?? 0;
          const dropOffRate = starts > 0 ? Math.round(((starts - completions) / starts) * 100) : 0;
          return { id: fid, name: flowNames.get(fid) ?? "Unknown Flow", starts, completions, dropOffRate };
        })
        .sort((a, b) => b.starts - a.starts)
        .slice(0, 10);
      setFlowPerformance(perfData);

      // Contact growth by day
      const growthByDay = new Map<string, number>();
      (contactEvents.data ?? []).forEach((e) => {
        const day = e.created_at.split("T")[0];
        growthByDay.set(day, (growthByDay.get(day) ?? 0) + 1);
      });
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      const growthData: DailyCount[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().split("T")[0];
        growthData.push({ date: dayStr, count: growthByDay.get(dayStr) ?? 0 });
      }
      setContactGrowth(growthData);

      // Message volume by day
      const sentByDay = new Map<string, number>();
      const failedByDay = new Map<string, number>();
      (msgEvents.data ?? []).forEach((e) => {
        const day = e.created_at.split("T")[0];
        if (e.event_type === "message_sent") {
          sentByDay.set(day, (sentByDay.get(day) ?? 0) + 1);
        } else {
          failedByDay.set(day, (failedByDay.get(day) ?? 0) + 1);
        }
      });
      const msgData: DailyMessages[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().split("T")[0];
        msgData.push({ date: dayStr, sent: sentByDay.get(dayStr) ?? 0, failed: failedByDay.get(dayStr) ?? 0 });
      }
      setMessageVolume(msgData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "custom", label: "Custom" },
  ];

  const statCards = [
    {
      label: "Total Flows",
      value: stats.totalFlows,
      icon: GitBranch,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    {
      label: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    },
    {
      label: "Messages Sent",
      value: stats.messagesSent,
      icon: Send,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      label: "Messages Failed",
      value: stats.messagesFailed,
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "group-hover:border-rose-500/50 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    },
  ];

  const maxContactGrowth = Math.max(...contactGrowth.map((d) => d.count), 0);
  const maxMessageVolume = Math.max(
    ...messageVolume.map((d) => d.sent + d.failed),
    0
  );

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border bg-background/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Activity className="h-7 w-7 text-primary" />
              Platform Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor your workspace performance and user engagement
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border backdrop-blur-sm shadow-inner">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition-all relative",
                    timeRange === option.value
                      ? "text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {timeRange === option.value && (
                    <motion.div
                      layoutId="activeRange"
                      className="absolute inset-0 bg-primary rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <AnimatePresence>
              {timeRange === "custom" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  className="flex items-center gap-3 p-1 bg-muted/40 rounded-xl border border-border shadow-inner"
                >
                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold focus:outline-none focus:ring-0 text-foreground cursor-pointer"
                    />
                  </div>
                  <span className="text-muted-foreground/50 text-xs font-bold">to</span>
                  <div className="flex items-center px-2">
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold focus:outline-none focus:ring-0 text-foreground cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={fetchAnalytics}
                    disabled={!customStart || !customEnd}
                    className="rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm ml-1"
                  >
                    Apply
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-32"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Gathering insights...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8 max-w-7xl mx-auto"
            >
              {/* Stats cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <motion.div
                    key={card.label}
                    variants={itemVariants}
                    className={cn(
                      "group relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden",
                      card.border
                    )}
                  >
                    <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity", card.bg)} />
                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl shadow-inner",
                          card.bg
                        )}
                      >
                        <card.icon className={cn("h-6 w-6", card.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="text-3xl font-black mt-1 text-foreground">{card.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Contact growth */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl shadow-primary/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Audience Growth</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        New contacts acquired per day
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  {contactGrowth.length > 0 ? (
                    <MiniBarChart
                      data={contactGrowth.map((d) => d.count)}
                      labels={contactGrowth.map((d) => formatShortDate(d.date))}
                      maxVal={maxContactGrowth}
                      color="bg-purple-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        No growth data for this period
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Message volume */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-xl shadow-primary/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Message Volume</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total messages sent vs failed
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-background/50 px-3 py-1.5 rounded-lg border border-border">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Sent
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        Failed
                      </span>
                    </div>
                  </div>
                  {messageVolume.length > 0 ? (
                    <MessageVolumeChart data={messageVolume} maxVal={maxMessageVolume} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-dashed border-border">
                      <Send className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        No messaging data for this period
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Flow performance table */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden">
                <div className="border-b border-border px-8 py-5 flex items-center justify-between bg-muted/10">
                  <h3 className="text-lg font-bold text-foreground">Top Performing Flows</h3>
                  <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {flowPerformance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-muted/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4 shadow-inner">
                      <GitBranch className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-bold text-foreground">No flow activity</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No automation flows were triggered in this period
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-background/40 text-left">
                          <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Flow Name
                          </th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                            Starts
                          </th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                            Completions
                          </th>
                          <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">
                            Drop-off Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {flowPerformance.map((flow) => (
                          <tr
                            key={flow.id}
                            className="transition-colors hover:bg-muted/40 group"
                          >
                            <td className="px-8 py-4">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {flow.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-foreground">
                                {flow.starts.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-foreground">
                                {flow.completions.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm",
                                    flow.dropOffRate > 50
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                      : flow.dropOffRate > 25
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  )}
                                >
                                  {flow.dropOffRate > 50 ? (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                  )}
                                  {flow.dropOffRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
