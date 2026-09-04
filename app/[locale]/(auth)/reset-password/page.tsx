"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, AlertCircle, Zap, Lock, ArrowRight } from "lucide-react";
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=password_updated");
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new secure password below
          </p>
        </motion.div>

        <motion.div variants={fadeIn} className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                  placeholder="Re-enter new password"
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
              {loading ? "Updating password..." : "Update Password"}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </motion.div>

        {/* Permanent Footer Attribution */}
        <motion.div variants={fadeIn} className="text-center text-xs text-muted-foreground/60 space-y-1">
          <p>© {new Date().getFullYear()} FlowStage • <span className="font-medium text-muted-foreground">All Rights Reserved</span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
