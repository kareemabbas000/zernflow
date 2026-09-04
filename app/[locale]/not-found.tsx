"use client";

import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-[var(--surface-2)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)]">
            <MapPinOff className="w-10 h-10 text-[var(--ink-3)]" />
          </div>
          <h1 className="font-display text-5xl font-black tracking-tight text-[var(--ink)] mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-4">
            We lost this page in the flow.
          </h2>
          <p className="text-[var(--ink-2)] font-medium mb-8 leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or is temporarily unavailable. 
          </p>
          <Button asChild size="lg" className="rounded-full font-bold bg-[var(--ink)] text-white hover:bg-black h-14 px-8">
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </Link>
          </Button>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
