"use client";

import { useState } from "react";
import {
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Building2,
  Mail,
  Key,
  Server,
  Zap,
} from "lucide-react";
import { updatePlatformSettingsAdmin } from "@/lib/actions/admin";

interface AdminSettingsProps {
  branding: {
    app_name: string;
    tagline: string;
    support_email: string;
    company_name: string;
  };
  features: {
    allow_signup: boolean;
    default_trial_days: number;
  };
  systemStatus: {
    supabaseConfigured: boolean;
    zernioConfigured: boolean;
    cronConfigured: boolean;
    aiGatewayConfigured: boolean;
  };
}

export function AdminSettingsView({
  branding: initialBranding,
  features: initialFeatures,
  systemStatus,
}: AdminSettingsProps) {
  const [branding, setBranding] = useState(initialBranding);
  const [features, setFeatures] = useState(initialFeatures);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await updatePlatformSettingsAdmin("branding", branding);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Platform branding updated successfully", type: "success" });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSaveFeatures(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await updatePlatformSettingsAdmin("features", features);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Platform feature flags saved", type: "success" });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system-wide branding, registration rules, and check provider connectivity status.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* System Health / Connectivity Status */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Infrastructure & Connectivity Health</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Supabase Backend</p>
                <p className="text-[10px] text-muted-foreground">Database, Auth & RLS</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
              <Check className="h-3 w-3" /> Connected
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Zernio Platform Key</p>
                <p className="text-[10px] text-muted-foreground">Social Multi-Tenant API</p>
              </div>
            </div>
            {systemStatus.zernioConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                <Check className="h-3 w-3" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Set ZERNIO_API_KEY
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Cron Job Engine</p>
                <p className="text-[10px] text-muted-foreground">Sequences & Scheduled Jobs</p>
              </div>
            </div>
            {systemStatus.cronConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                <Check className="h-3 w-3" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Set CRON_SECRET
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">AI Gateway / Fallback</p>
                <p className="text-[10px] text-muted-foreground">AI Response Flow Nodes</p>
              </div>
            </div>
            {systemStatus.aiGatewayConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                <Check className="h-3 w-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Optional
              </span>
            )}
          </div>
        </div>
      </div>

      {/* White-label Branding Settings */}
      <form onSubmit={handleSaveBranding} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">White-Label Platform Branding</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Product / SaaS Name
            </label>
            <input
              type="text"
              value={branding.app_name}
              onChange={(e) => setBranding({ ...branding, app_name: e.target.value })}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Support Email
            </label>
            <input
              type="email"
              value={branding.support_email}
              onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Company / Legal Entity Name
            </label>
            <input
              type="text"
              value={branding.company_name}
              onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Branding Changes
        </button>
      </form>
    </div>
  );
}
