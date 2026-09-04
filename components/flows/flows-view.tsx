"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Sparkles, Plug, ArrowRight, Zap } from "lucide-react";
import { CreateFlowButton } from "@/components/create-flow-button";
import { ImportFlowButton, ExportFlowButton, DeleteFlowButton } from "@/components/flow-actions";
import type { FlowStatus, Json } from "@/lib/types/database";
import { motion } from "framer-motion";

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
    classes: "bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--border)]",
  },
  published: {
    label: "Published",
    classes: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
  },
  archived: {
    label: "Archived",
    classes: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="flex h-full flex-col relative"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--brand)]/5 rounded-sm blur-[100px] pointer-events-none -z-10" />

      <div className="border-b border-[var(--border)] bg-[var(--paper)]/50 backdrop-blur-xl px-8 py-8">
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2">
              Flows & Autopilot
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Build and deploy automated chatbot flows to your social channels
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <ImportFlowButton />
            <Link
              href="/dashboard/flows/templates"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--paper)] px-4 py-2 text-sm font-semibold shadow-none hover:bg-[var(--surface)] transition-colors group"
            >
              <Sparkles className="h-4 w-4 text-amber-500 group-hover:" />
              Templates
            </Link>
            <CreateFlowButton />
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-8">
        {channelCount === 0 && (
          <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between rounded-md border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-6 shadow-none">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--brand-soft)]">
                <Plug className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-base font-bold text-[var(--ink)]">Connect a channel to get started</p>
                <p className="text-sm text-[var(--ink-2)] mt-1">
                  Link your social media accounts so your flows can send and receive messages.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/channels"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand)]-foreground shadow-none shadow-primary/20 hover:bg-[var(--brand)]/90 transition-all group"
            >
              Connect Channel
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

        {flows.length === 0 ? (
          <motion.div variants={itemVariants} className="mt-12 rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--paper)]/30 p-16 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-md bg-[var(--surface)]">
              <GitBranch className="h-10 w-10 text-[var(--ink-2)]" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">No flows yet</h2>
            <p className="mt-2 text-sm text-[var(--ink-2)] max-w-md mx-auto">
              Create your first flow to start automating conversations across your channels.
            </p>
            <div className="mt-8 flex justify-center">
              <CreateFlowButton />
            </div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                <motion.div key={flow.id} variants={itemVariants} whileHover={{ y: -4 }}>
                  <Link
                    href={`/dashboard/flows/${flow.id}`}
                    className="group relative flex h-full flex-col justify-between rounded-[1.5rem] border border-[var(--border)] bg-[var(--paper)] p-6 shadow-none transition-all hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-[var(--brand)]-foreground transition-colors shadow-inner">
                            <GitBranch className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
                                {flow.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.classes}`}
                              >
                                {status.label}
                              </span>
                              <span className="text-xs text-[var(--ink-2)] font-medium">
                                • {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--paper)]/80 backdrop-blur-md rounded-md p-1 border border-[var(--border)]">
                          <ExportFlowButton flow={flow} />
                          <DeleteFlowButton flow={flow} onDeleted={handleOptimisticDelete} />
                        </div>
                      </div>

                      {/* Autopilot Channel Deployment Badge */}
                      <div className="mt-6 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-2)] group-hover:border-[var(--brand)]/20 group-hover:text-[var(--ink)] transition-colors">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          Autopilot: {deploymentLabel}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                      <p className="text-xs font-medium text-[var(--ink-2)]">
                        Updated {formatDate(flow.updated_at)}
                      </p>
                      <ArrowRight className="h-4 w-4 text-[var(--ink-2)] group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
