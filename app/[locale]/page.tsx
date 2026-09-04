"use client";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingHero } from "@/components/marketing/marketing-hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main>
        <MarketingHero />
        {/* Other sections will go here */}
      </main>
    </div>
  );
}
