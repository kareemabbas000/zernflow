"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, Shield, User, Loader2, ArrowRight } from "lucide-react";
import { acceptInvite } from "@/lib/actions/team";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3.5 w-3.5" />,
  admin: <Shield className="h-3.5 w-3.5" />,
  member: <User className="h-3.5 w-3.5" />,
};

export function AcceptInviteView({
  inviteId,
  workspaceName,
  inviterName,
  role,
  email,
  isLoggedIn,
  currentUserEmail,
}: {
  inviteId: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  email: string;
  isLoggedIn: boolean;
  currentUserEmail: string | null;
}) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailMismatch =
    isLoggedIn && currentUserEmail && currentUserEmail !== email;

  async function handleAccept() {
    if (accepting) return;
    setAccepting(true);
    setError(null);

    const result = await acceptInvite(inviteId);

    if (result.error) {
      setError(result.error);
      setAccepting(false);
      return;
    }

    // Redirect to dashboard
    router.push("/dashboard/inbox");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">You&apos;re invited!</h1>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{inviterName}</strong> invited you to join their workspace
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 text-center shadow-xl shadow-primary/5 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{workspaceName}</h2>
          <div className="flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold capitalize">
              {roleIcons[role] ?? roleIcons.member}
              {role}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Invited as <strong className="text-foreground">{email}</strong>
          </p>

          {isLoggedIn && !emailMismatch && (
            <div className="pt-3 space-y-3">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining Workspace...
                  </>
                ) : (
                  <>
                    Accept Invite &amp; Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {error && (
                <p className="text-center text-xs font-semibold text-destructive">{error}</p>
              )}
            </div>
          )}

          {isLoggedIn && emailMismatch && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs">
              <p className="text-amber-700 dark:text-amber-300">
                You are currently signed in as{" "}
                <span className="font-bold">{currentUserEmail}</span>, but this invitation was sent to{" "}
                <span className="font-bold">{email}</span>.
              </p>
              <div className="mt-3">
                <Link
                  href="/login"
                  className="inline-flex rounded-xl bg-card border border-border px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Switch Account
                </Link>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="pt-3 space-y-3">
              <Link
                href={`/login?next=/invite/${inviteId}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
              >
                Sign In to Accept
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/register?next=/invite/${inviteId}`}
                  className="font-bold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Permanent Footer Attribution */}
        <div className="text-center text-xs text-muted-foreground">
          © 2026 KA COMM • <span className="font-semibold text-foreground">Developed by Kareem Abbas</span>
        </div>
      </div>
    </div>
  );
}
