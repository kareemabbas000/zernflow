"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Zap, Mail } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <motion.div variants={fadeIn} className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity justify-center mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-blue-500 p-[1px] shadow-lg shadow-primary/20">
               <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                  <Zap className="text-foreground h-5 w-5" />
               </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">FlowStage</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a recovery link
          </p>
        </motion.div>

        <motion.div variants={fadeIn} className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If an account exists for <strong className="text-foreground">{email}</strong>, you
                will receive an email with instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 disabled:opacity-50 transition-all group"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </motion.div>

        {/* Permanent Footer Attribution */}
        <motion.div variants={fadeIn} className="text-center text-xs text-muted-foreground/60 space-y-1">
          <p>© {new Date().getFullYear()} FlowStage • <span className="font-medium text-muted-foreground">All Rights Reserved</span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
