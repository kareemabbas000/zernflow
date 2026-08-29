"use client";

import { useState } from "react";
import {
  Search,
  FileText,
  Clock,
  User,
  Building2,
  Sliders,
  Shield,
  Plug,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AuditLog } from "@/lib/admin";

interface AuditLogWithActor extends AuditLog {
  profiles?: {
    email: string;
    full_name: string | null;
  } | null;
  workspaces?: {
    name: string;
  } | null;
}

export function AuditLogsView({ initialLogs }: { initialLogs: AuditLogWithActor[] }) {
  const [logs] = useState<AuditLogWithActor[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.target_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.profiles?.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || l.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable chronological log of all administrative, security, and tenant lifecycle events.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, target, actor email..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none w-full sm:w-auto"
        >
          <option value="all">All Action Types</option>
          {actionTypes.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Timeline / Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">No audit logs recorded.</p>
          ) : (
            filtered.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                        {log.action.startsWith("user") ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : log.action.startsWith("workspace") ? (
                          <Building2 className="h-4 w-4 text-indigo-500" />
                        ) : log.action.startsWith("channel") ? (
                          <Plug className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Sliders className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            by {log.profiles?.email || log.actor_user_id?.slice(0, 8) || "System"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Target: <strong className="text-foreground">{log.target_type}</strong> ({log.target_id || "N/A"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="inline-flex items-center gap-0.5 text-primary hover:underline font-medium"
                        >
                          Payload
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && log.metadata && (
                    <div className="rounded-lg bg-muted/70 p-3 mt-2 overflow-x-auto">
                      <pre className="font-mono text-[11px] text-foreground">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
