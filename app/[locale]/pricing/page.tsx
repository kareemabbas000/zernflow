"use client";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPricing } from "@/components/marketing/marketing-pricing";
import { MarketingFAQ } from "@/components/marketing/marketing-faq";
import { MarketingCTA } from "@/components/marketing/marketing-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-24">
        <MarketingPricing />
        <MarketingFAQ />
        <MarketingCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
