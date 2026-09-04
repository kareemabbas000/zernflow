"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-[var(--danger)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--danger)]/20">
            <AlertTriangle className="w-10 h-10 text-[var(--danger)]" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-[var(--ink)] mb-4">
            Something went wrong.
          </h1>
          <p className="text-[var(--ink-2)] font-medium mb-8 leading-relaxed">
            We've encountered an unexpected error. Our team has been notified. 
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => reset()} size="lg" className="rounded-full font-bold bg-[var(--ink)] text-white hover:bg-black h-14 px-8">
              <RotateCcw className="w-5 h-5 mr-2" /> Try again
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full font-bold h-14 px-8 border-[var(--border-strong)]">
              <Link href="/">
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
