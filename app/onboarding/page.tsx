"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createWorkspace } from "@/lib/actions/workspace";
import { BrandLogo } from "@/components/brand-logo";
import {
  Building2,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Share2,
  Bot,
  Zap,
} from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkExistingWorkspace() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user already has profile and membership
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      } else {
        const metaName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "";
        setFullName(metaName);
      }

      // Check if user already has an active workspace
      const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, name, status)")
        .eq("user_id", user.id)
        .limit(1);

      if (memberships && memberships.length > 0 && memberships[0].workspaces) {
        router.push("/dashboard/inbox");
        return;
      }

      setInitializing(false);
    }

    checkExistingWorkspace();
  }, [router, supabase]);

  async function handleCompleteOnboarding(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedWs = workspaceName.trim();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Please provide your name.");
      setLoading(false);
      return;
    }

    if (!trimmedWs) {
      setError("Please provide a workspace name.");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Update user profile
      await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", user.id);

      // 2. Create workspace
      const res = await createWorkspace(trimmedWs);

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Step 3: Success animation and redirect to inbox
      setStep(3);
      setTimeout(() => {
        router.push("/dashboard/inbox");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err instanceof Error ? err.message : "Failed to set up workspace.");
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Preparing KA COMM workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <BrandLogo size="lg" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {step === 1 && "Welcome to KA COMM"}
            {step === 2 && "Configure your workspace"}
            {step === 3 && "You're all set!"}
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {step === 1 && "Let's set up your intelligent communication hub for multi-channel messaging & AI automation."}
            {step === 2 && "Your workspace keeps your connected channels, contacts, flows, and inbox secure."}
            {step === 3 && "Redirecting to your live dashboard..."}
          </p>
        </div>

        {/* Modern Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-16 rounded-full transition-colors ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Step 1: Welcome & Profile */}
        {step === 1 && (
          <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-primary/5 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Your Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label htmlFor="workspaceName" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Workspace / Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="workspaceName"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g. Acme Studio or Growth Agency"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Included with your workspace:
              </div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Multi-channel connections (Facebook, Instagram, WhatsApp, Telegram, X)</li>
                <li>• Unified Live Inbox with real-time audio notifications</li>
                <li>• Drag-and-drop Visual Flow Builder &amp; AI Copilot</li>
              </ul>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!fullName.trim() || !workspaceName.trim()) {
                  setError("Please fill out both your name and workspace name.");
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Confirmation & Workspace Setup */}
        {step === 2 && (
          <form onSubmit={handleCompleteOnboarding} className="rounded-3xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-primary/5 space-y-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border p-4 bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{workspaceName}</h3>
                      <p className="text-xs text-muted-foreground">Admin: {fullName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-border p-3 flex flex-col gap-1.5 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Unified Inbox</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">All your channels in one place</p>
                </div>
                <div className="rounded-xl border border-border p-3 flex flex-col gap-1.5 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-foreground">Smart Automations</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Visual flow builder & auto-replies</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-xs font-bold hover:bg-muted transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    Launch Workspace
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Workspace Ready!</h2>
            <p className="text-xs text-muted-foreground">
              Opening your KA COMM live communication center...
            </p>
          </div>
        )}

        {/* Permanent Footer */}
        <div className="text-center text-xs text-muted-foreground">
          © 2026 KA COMM • <span className="font-semibold text-foreground">Developed by Kareem Abbas</span>
        </div>
      </div>
    </div>
  );
}
