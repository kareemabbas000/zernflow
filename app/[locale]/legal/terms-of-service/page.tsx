"use client";

import * as React from "react"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-[var(--ink-2)] font-medium">Last updated: October 2024</p>
          </header>
          
          <article className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--brand)] hover:prose-a:text-[var(--brand-hover)] prose-p:text-[var(--ink-2)] prose-p:font-medium prose-p:leading-relaxed prose-li:text-[var(--ink-2)] prose-li:font-medium">
            <p>
              Please read these Terms of Service ("Terms") carefully before using the FlowStage website and product (the "Service") operated by FlowStage Inc ("us", "we", or "our").
            </p>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </p>
            <h2>2. Subscriptions</h2>
            <p>
              Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select when purchasing a Subscription.
            </p>
            <h2>3. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
            </p>
            <h2>4. API Limits</h2>
            <p>
              Depending on your subscription tier, certain API rate limits may apply. Attempting to bypass or exploit these limits may result in immediate suspension of your account.
            </p>
            <h2>5. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
