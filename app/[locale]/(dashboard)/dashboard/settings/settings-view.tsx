"use client";

import { useState } from "react";
import {
  Settings,
  Hash,
  Save,
  Plus,
  X,
  Check,
  Eye,
  EyeOff,
  Users,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Info,
  Scale,
  Building,
  Key,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkspaceSettings {
  id: string;
  name: string;
  plan: string;
  status: string;
  hasAiKey: boolean;
  globalKeywords: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function SettingsView({
  workspace,
}: {
  workspace: WorkspaceSettings;
}) {
  const [name, setName] = useState(workspace.name);
  const [aiKey, setAiKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(workspace.globalKeywords);
  const [newKeyword, setNewKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addKeyword() {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      setNewKeyword("");
      return;
    }
    setKeywords((prev) => [...prev, trimmed]);
    setNewKeyword("");
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();

      const update: Record<string, unknown> = {
        name: name.trim(),
        global_keywords: keywords,
      };

      if (aiKey.trim()) {
        update.ai_api_key = aiKey.trim();
      }

      const { error: updateError } = await supabase
        .from("workspaces")
        .update(update)
        .eq("id", workspace.id)
        .select("id")
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSaved(true);
      setAiKey("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border bg-background/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary animate-spin-slow" />
          Workspace Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage workspace preferences, AI configurations, and global keywords
        </p>
      </motion.div>

      {/* Settings form */}
      <div className="flex-1 overflow-auto relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-3xl space-y-8 px-8 py-8">
          {/* General Workspace Details */}
          <motion.section variants={itemVariants} className="group relative rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:border-primary/30">
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">General Preferences</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Core identity and billing details</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm border border-border">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Workspace Identifier</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{workspace.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary capitalize shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {workspace.plan} Plan
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* AI Gateway API Key */}
          <motion.section variants={itemVariants} className="group relative rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:border-blue-500/30">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 shadow-inner">
                <Key className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">AI Copilot &amp; LLM Configuration</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Custom AI key for generative responses</p>
              </div>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="relative">
                <input
                  type={showAiKey ? "text" : "password"}
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder={
                    workspace.hasAiKey
                      ? "Enter a new key to replace current key"
                      : "sk-ant-... or sk-... (optional)"
                  }
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 pr-12 text-sm font-mono placeholder:text-muted-foreground placeholder:font-sans outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAiKey(!showAiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {workspace.hasAiKey && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg inline-flex">
                  <Check className="h-4 w-4" />
                  Custom AI key active and verified
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Global Keywords */}
          <motion.section variants={itemVariants} className="group relative rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-primary/5 transition-all duration-300 hover:border-pink-500/30">
            <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-pink-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 shadow-inner">
                <Hash className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Global Automation Keywords</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Triggers across all connected channels</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="e.g. stop, help, pricing"
                  className="flex-1 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500 focus:bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  disabled={!newKeyword.trim()}
                  className="rounded-xl bg-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-[40px]">
                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {keywords.map((kw) => (
                        <motion.span
                          key={kw}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-bold text-pink-600 dark:text-pink-400"
                        >
                          #{kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(kw)}
                            className="rounded-full p-0.5 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border border-dashed border-border rounded-xl bg-muted/20">
                    <p className="text-sm font-semibold text-muted-foreground/70">
                      No global keywords configured yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Team Management */}
          <motion.section variants={itemVariants} className="group relative rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-xl shadow-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:border-purple-500/30">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-purple-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 shadow-inner shrink-0">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Team &amp; Permissions</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Invite members and manage roles
                </p>
              </div>
            </div>
            
            <Link
              href="/dashboard/settings/team"
              className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-bold text-foreground shadow-sm hover:bg-muted hover:border-muted-foreground/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              <Shield className="h-4 w-4" />
              Manage Team
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </motion.section>

          {/* About FlowStage & Legal Attribution */}
          <motion.section variants={itemVariants} className="rounded-3xl border border-border/80 bg-muted/30 p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px] shadow-sm">
                   <div className="w-full h-full bg-[#050505] rounded-[7px] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                   </div>
                </div>
                <span className="font-bold text-foreground text-lg tracking-tight">FlowStage</span>
              </div>
              <Link
                href="/legal/open-source"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
              >
                <Scale className="h-3.5 w-3.5" />
                Legal Notices
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              FlowStage is an AI-powered omnichannel communication and customer engagement platform built for modern teams.
            </p>
            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>© {new Date().getFullYear()} FlowStage Inc. All rights reserved.</span>
            </div>
          </motion.section>

          {/* Save Action */}
          <motion.div variants={itemVariants} className="sticky bottom-8 z-20 flex items-center justify-between p-4 rounded-2xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>

              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl"
                  >
                    <Check className="h-4 w-4" />
                    Settings saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
