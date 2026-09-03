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
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";

interface WorkspaceSettings {
  id: string;
  name: string;
  plan: string;
  status: string;
  hasAiKey: boolean;
  globalKeywords: string[];
}

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
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 bg-card/40">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage workspace preferences, AI configurations, and global keywords
        </p>
      </div>

      {/* Settings form */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
          {/* General Workspace Details */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">General Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 p-3.5">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Workspace Identifier</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{workspace.id}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary capitalize">
                  {workspace.plan} Plan
                </span>
              </div>
            </div>
          </section>

          {/* AI Gateway API Key */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00C2FF]" />
              <h2 className="text-sm font-bold text-foreground">AI Copilot &amp; LLM Configuration</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Custom AI key for OpenAI, Anthropic, or Vercel AI Gateway for contextual auto-responses.
              {workspace.hasAiKey && " A custom key is configured."}
            </p>

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
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm font-mono placeholder:text-muted-foreground placeholder:font-sans outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowAiKey(!showAiKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {workspace.hasAiKey && (
              <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Custom AI key active
              </p>
            )}
          </section>

          {/* Global Keywords */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#FF3D81]" />
              <h2 className="text-sm font-bold text-foreground">Global Automation Keywords</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keywords that trigger global opt-in/out or conversation actions across all connected channels.
            </p>

            <div className="flex gap-2">
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
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="rounded-full p-0.5 hover:bg-primary/10 text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/70">
                No global keywords configured yet
              </p>
            )}
          </section>

          {/* Team Management */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Team &amp; Permissions</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Invite team members and collaborate within this workspace.
              </p>
            </div>
            <Link
              href="/dashboard/settings/team"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              Manage Team
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </section>

          {/* About KA COMM & Legal Attribution */}
          <section className="rounded-3xl border border-border/80 bg-muted/20 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <BrandLogo size="sm" />
              <Link
                href="/legal/open-source"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Scale className="h-3.5 w-3.5" />
                Open Source Notices
              </Link>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              KA COMM is an AI-powered omnichannel communication and customer engagement SaaS.
            </p>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>© 2026 KA COMM</span>
              <span className="font-semibold text-foreground">Developed by Kareem Abbas</span>
            </div>
          </section>

          {/* Save Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>

            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <Check className="h-4 w-4" />
                Settings saved successfully
              </span>
            )}

            {error && (
              <span className="text-xs font-semibold text-destructive">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
