"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, MessageSquare, Sparkles } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const queryMessage = searchParams.get("message");
  const queryError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, platform_role")
        .eq("id", data.user.id)
        .single();

      if (profile?.status === "suspended") {
        await supabase.auth.signOut();
        setError("This account has been suspended. Please contact platform support.");
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard/inbox");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <BrandLogo size="lg" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-xs text-muted-foreground">
          Sign in to access your intelligent communication workspace
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-primary/5 space-y-5">
        {queryMessage === "password_updated" && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Password updated successfully. Please sign in.
          </div>
        )}

        {queryError === "account_suspended" && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Your account has been suspended.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Signing in..." : "Sign In to Workspace"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create account
          </Link>
        </div>
      </div>

      {/* Permanent Footer Attribution */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>© 2026 KA COMM • <span className="font-semibold text-foreground">Developed by Kareem Abbas</span></p>
        <p className="text-[11px] text-muted-foreground/80">
          <Link href="/legal/open-source" className="hover:underline">Open Source Notices</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none -z-10" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
