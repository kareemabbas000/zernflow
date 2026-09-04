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
  Activity,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  updatePlatformSettingsAdmin,
  testSystemHealthAdmin,
  updateUserPasswordAdmin,
} from "@/lib/actions/admin";

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
  apiKeys?: {
    zernio_api_key?: string;
    oauth_state_secret?: string;
    cron_secret?: string;
  };
  systemStatus: {
    supabaseConfigured: boolean;
    zernioConfigured: boolean;
    cronConfigured: boolean;
    aiGatewayConfigured: boolean;
  };
  marketingSettings?: {
    social_proof_enabled: boolean;
    social_proof_content: any[] | null;
  };
  currentAdminId?: string;
}

export function AdminSettingsView({
  branding: initialBranding,
  features: initialFeatures,
  apiKeys: initialApiKeys = {},
  systemStatus,
  marketingSettings: initialMarketingSettings = { social_proof_enabled: true, social_proof_content: null },
  currentAdminId,
}: AdminSettingsProps) {
  const [branding, setBranding] = useState(initialBranding);
  const [features, setFeatures] = useState(initialFeatures);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [marketingSettings, setMarketingSettings] = useState(initialMarketingSettings);

  const [savingBranding, setSavingBranding] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [savingApiKeys, setSavingApiKeys] = useState(false);
  const [savingMarketingSettings, setSavingMarketingSettings] = useState(false);

  const [marketingJsonStr, setMarketingJsonStr] = useState(() => 
    initialMarketingSettings?.social_proof_content 
      ? JSON.stringify(initialMarketingSettings.social_proof_content, null, 2) 
      : ""
  );

  const [adminPassword, setAdminPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [testingHealth, setTestingHealth] = useState(false);
  const [healthResults, setHealthResults] = useState<{
    zernio: { ok: boolean; latencyMs: number; message: string };
    supabase: { ok: boolean; latencyMs: number; message: string };
  } | null>(null);

  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSavingBranding(true);
    setFeedback(null);

    const res = await updatePlatformSettingsAdmin("branding", branding);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Platform branding updated successfully", type: "success" });
    }
    setSavingBranding(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSaveFeatures(e: React.FormEvent) {
    e.preventDefault();
    setSavingFeatures(true);
    setFeedback(null);

    const res = await updatePlatformSettingsAdmin("features", features);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Platform feature rules saved", type: "success" });
    }
    setSavingFeatures(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSaveMarketingSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingMarketingSettings(true);
    setFeedback(null);

    let parsedContent = null;
    if (marketingJsonStr.trim()) {
      try {
        parsedContent = JSON.parse(marketingJsonStr);
      } catch (err) {
        setFeedback({ message: "Invalid JSON in social proof content", type: "error" });
        setSavingMarketingSettings(false);
        return;
      }
    }

    const payload = {
      ...marketingSettings,
      social_proof_content: parsedContent,
    };

    const res = await updatePlatformSettingsAdmin("marketing_settings", payload);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Marketing settings saved", type: "success" });
    }
    setSavingMarketingSettings(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSaveApiKeys(e: React.FormEvent) {
    e.preventDefault();
    setSavingApiKeys(true);
    setFeedback(null);

    const res = await updatePlatformSettingsAdmin("api_keys", apiKeys);

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Platform API secrets & overrides updated", type: "success" });
    }
    setSavingApiKeys(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleChangeMyPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentAdminId || !adminPassword.trim()) return;
    setSavingPassword(true);
    setFeedback(null);

    const res = await updateUserPasswordAdmin(currentAdminId, adminPassword.trim());

    if (res.error) {
      setFeedback({ message: res.error, type: "error" });
    } else {
      setFeedback({ message: "Admin password successfully updated", type: "success" });
      setAdminPassword("");
    }
    setSavingPassword(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleRunDiagnostics() {
    setTestingHealth(true);
    try {
      const res = await testSystemHealthAdmin();
      setHealthResults(res);
      setFeedback({ message: "System health check finished", type: "success" });
    } catch (err: any) {
      setFeedback({ message: `Health check error: ${err?.message}`, type: "error" });
    }
    setTestingHealth(false);
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Configuration & Secrets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Root environment variables, dynamic API keys, system branding, and connectivity diagnostics.
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

      {/* System Health / Diagnostics */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Infrastructure & Connectivity Health</h2>
          </div>
          <button
            onClick={handleRunDiagnostics}
            disabled={testingHealth}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50"
          >
            {testingHealth ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Activity className="h-3.5 w-3.5 text-primary" />
            )}
            Run Diagnostics
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Supabase */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium">Supabase Database & Auth</p>
                <p className="text-[10px] text-muted-foreground">
                  {healthResults?.supabase.message || "Connected via Service Role"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {healthResults ? `${healthResults.supabase.latencyMs}ms` : "Active"}
            </span>
          </div>

          {/* Zernio */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium">Zernio Omnichannel Gateway</p>
                <p className="text-[10px] text-muted-foreground">
                  {healthResults?.zernio.message || "Social API Ready"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              {healthResults ? `${healthResults.zernio.latencyMs}ms` : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic API Secrets & Provider Variables */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Dynamic Platform Secrets & API Keys</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure runtime API key overrides. When populated, these settings take priority over build-time environment variables.
        </p>

        <form onSubmit={handleSaveApiKeys} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Platform Zernio API Key</label>
            <input
              type="password"
              value={apiKeys.zernio_api_key || ""}
              onChange={(e) => setApiKeys({ ...apiKeys, zernio_api_key: e.target.value })}
              placeholder="e.g. zernio_live_..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">OAuth State Secret</label>
              <input
                type="password"
                value={apiKeys.oauth_state_secret || ""}
                onChange={(e) => setApiKeys({ ...apiKeys, oauth_state_secret: e.target.value })}
                placeholder="zernflow_oauth_secret_..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Cron Secret</label>
              <input
                type="password"
                value={apiKeys.cron_secret || ""}
                onChange={(e) => setApiKeys({ ...apiKeys, cron_secret: e.target.value })}
                placeholder="kacomm_cron_secret_..."
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingApiKeys}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingApiKeys && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save API Secrets
            </button>
          </div>
        </form>
      </div>

      {/* Admin Self Password Management */}
      {currentAdminId && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Super Admin Security & Password</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Update your own master administrator password directly.
          </p>

          <form onSubmit={handleChangeMyPassword} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">New Master Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword || adminPassword.length < 6}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Platform Branding Form */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Branding & White-labeling</h2>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Application Name</label>
              <input
                type="text"
                value={branding.app_name}
                onChange={(e) => setBranding({ ...branding, app_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Tagline</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Support Email</label>
              <input
                type="email"
                value={branding.support_email}
                onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Company Attribution</label>
              <input
                type="text"
                value={branding.company_name}
                onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingBranding}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingBranding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Branding
            </button>
          </div>
        </form>
      </div>

      {/* Feature Flags */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Tenant Policies & Quotas</h2>
        </div>

        <form onSubmit={handleSaveFeatures} className="space-y-4 pt-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div>
              <p className="text-xs font-medium">Public User Registrations</p>
              <p className="text-[10px] text-muted-foreground">Allow new signups on the landing page</p>
            </div>
            <input
              type="checkbox"
              checked={features.allow_signup}
              onChange={(e) => setFeatures({ ...features, allow_signup: e.target.checked })}
              className="h-4 w-4 rounded accent-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Default Trial Days</label>
            <input
              type="number"
              value={features.default_trial_days}
              onChange={(e) => setFeatures({ ...features, default_trial_days: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingFeatures}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingFeatures && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Policies
            </button>
          </div>
        </form>
      </div>

      {/* Marketing Settings */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Landing Page Marketing</h2>
        </div>

        <form onSubmit={handleSaveMarketingSettings} className="space-y-4 pt-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3.5">
            <div>
              <p className="text-xs font-medium">Enable Social Proof Section</p>
              <p className="text-[10px] text-muted-foreground">Show testimonials on the landing page</p>
            </div>
            <input
              type="checkbox"
              checked={marketingSettings.social_proof_enabled}
              onChange={(e) => setMarketingSettings({ ...marketingSettings, social_proof_enabled: e.target.checked })}
              className="h-4 w-4 rounded accent-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Social Proof JSON Content</label>
            <p className="text-[10px] text-muted-foreground mb-1">Leave empty or invalid JSON to use default content.</p>
            <textarea
              value={marketingJsonStr}
              onChange={(e) => setMarketingJsonStr(e.target.value)}
              rows={8}
              placeholder="[{ ...testimonial object }]"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingMarketingSettings}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingMarketingSettings && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Marketing Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
