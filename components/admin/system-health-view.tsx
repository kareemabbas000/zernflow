"use client";

import { Activity, Database, Server, Zap, Clock, AlertTriangle, ShieldCheck, Bug } from "lucide-react";
import { useState } from "react";

export function SystemHealthView({ errors, snapshots, metrics }: { errors: any[], snapshots: any[], metrics: any }) {
  const [activeTab, setActiveTab] = useState<"metrics" | "errors">("metrics");

  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform operational status and error logs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Database Size</span>
            <Database className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.dbSize}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Connections</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.activeConnections}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Realtime Channels</span>
            <Server className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.realtimeChannels}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">System Uptime</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.uptime}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "metrics" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recent Metrics
        </button>
        <button
          onClick={() => setActiveTab("errors")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "errors" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Error Logs ({errors.length})
        </button>
      </div>

      {activeTab === "metrics" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Metric</th>
                <th className="px-5 py-3 font-semibold">Value</th>
                <th className="px-5 py-3 font-semibold">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {snapshots.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                    No metric snapshots found.
                  </td>
                </tr>
              ) : (
                snapshots.map(s => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-xs">{s.metric_name}</td>
                    <td className="px-5 py-3 font-mono text-xs">{s.metric_value}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(s.recorded_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Error</th>
                <th className="px-5 py-3 font-semibold">Workspace</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {errors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    No recent errors found. System is healthy.
                  </td>
                </tr>
              ) : (
                errors.map(err => (
                  <tr key={err.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        <Bug className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs text-red-500">{err.error_type}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md truncate">{err.error_message}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs">{err.workspaces?.name || "-"}</td>
                    <td className="px-5 py-3 text-xs">{err.users?.email || "-"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-[10px]">
                      {new Date(err.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
