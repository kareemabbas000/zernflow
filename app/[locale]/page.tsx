"use client";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingSocialProof } from "@/components/marketing/marketing-social-proof";
import { MarketingFeatures } from "@/components/marketing/marketing-features";
import { MarketingChannels } from "@/components/marketing/marketing-channels";
import { MarketingBeforeAfter } from "@/components/marketing/marketing-before-after";
import { MarketingHowItWorks } from "@/components/marketing/marketing-how-it-works";
import { MarketingThreeSteps } from "@/components/marketing/marketing-three-steps";
import { MarketingPricing } from "@/components/marketing/marketing-pricing";
import { MarketingFAQ } from "@/components/marketing/marketing-faq";
import { MarketingCTA } from "@/components/marketing/marketing-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main>
        <MarketingHero />
        <MarketingSocialProof />
        <MarketingFeatures />
        <MarketingChannels />
        <MarketingBeforeAfter />
        <MarketingHowItWorks />
        <MarketingThreeSteps />
        <MarketingPricing />
        <MarketingFAQ />
        <MarketingCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
