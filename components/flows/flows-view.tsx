"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Sparkles, Plug } from "lucide-react";
import { CreateFlowButton } from "@/components/create-flow-button";
import { ImportFlowButton, ExportFlowButton, DeleteFlowButton } from "@/components/flow-actions";
import type { FlowStatus, Json } from "@/lib/types/database";

interface FlowItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  updated_at: string;
  version: number;
  nodes: Json;
  edges: Json;
}

interface ChannelItem {
  id: string;
  platform: string;
  display_name?: string | null;
  username?: string | null;
}

const statusConfig: Record<FlowStatus, { label: string; classes: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-muted text-muted-foreground",
  },
  published: {
    label: "Published",
    classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  archived: {
    label: "Archived",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FlowsView({
  initialFlows,
  channels,
  channelCount,
}: {
  initialFlows: FlowItem[];
  channels: ChannelItem[];
  channelCount: number;
}) {
  const [flows, setFlows] = useState<FlowItem[]>(initialFlows);
  const channelMap = new Map(channels.map((c) => [c.id, c]));

  function handleOptimisticDelete(flowId: string) {
    setFlows((prev) => prev.filter((f) => f.id !== flowId));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Flows & Autopilot</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build and deploy automated chatbot flows to your social channels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ImportFlowButton />
            <Link
              href="/dashboard/flows/templates"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Templates
            </Link>
            <CreateFlowButton />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {channelCount === 0 && (
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-dashed border-border bg-card p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Connect a channel to get started</p>
              <p className="text-xs text-muted-foreground">
                Link your social media accounts so your flows can send and receive messages.
              </p>
            </div>
            <Link
              href="/dashboard/channels"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Connect
            </Link>
          </div>
        )}

        {flows.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
            <GitBranch className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No flows yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first flow to start automating conversations.
            </p>
            <div className="mt-4">
              <CreateFlowButton />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => {
              const status = statusConfig[flow.status as FlowStatus] ?? statusConfig.draft;
              const nodes = Array.isArray(flow.nodes) ? (flow.nodes as any[]) : [];
              const nodeCount = nodes.length;

              const triggerNode = nodes.find((n) => n.type === "trigger");
              const channelId = triggerNode?.data?.channelId;
              const deployedChannel = channelId ? channelMap.get(channelId) : null;

              let deploymentLabel = "All Channels";
              if (deployedChannel) {
                deploymentLabel = `${deployedChannel.platform.toUpperCase()}: ${
                  deployedChannel.username
                    ? `@${deployedChannel.username.replace(/^@/, "")}`
                    : deployedChannel.display_name || "Channel"
                }`;
              }

              return (
                <Link
                  key={flow.id}
                  href={`/dashboard/flows/${flow.id}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {flow.name}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${status.classes}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExportFlowButton flow={flow} />
                        <DeleteFlowButton flow={flow} onDeleted={handleOptimisticDelete} />
                      </div>
                    </div>

                    {/* Autopilot Channel Deployment Badge */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-foreground/80">
                        ⚡ Autopilot: {deploymentLabel}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Updated {formatDate(flow.updated_at)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
