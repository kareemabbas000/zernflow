"use client";

import * as React from "react"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-[var(--ink-2)] font-medium">Last updated: October 2024</p>
          </header>
          
          <article className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--brand)] hover:prose-a:text-[var(--brand-hover)] prose-p:text-[var(--ink-2)] prose-p:font-medium prose-p:leading-relaxed prose-li:text-[var(--ink-2)] prose-li:font-medium">
            <p>
              At FlowStage, we take your privacy seriously. This policy describes what personal information we collect, how we use it, and your choices regarding this information.
            </p>
            <h2>Information we collect</h2>
            <p>
              We collect information to provide better services to all our users. The information FlowStage collects, and how that information is used, depends on how you use our services and how you manage your privacy controls.
            </p>
            <ul>
              <li><strong>Account information:</strong> When you sign up, we ask for your name and email.</li>
              <li><strong>Usage data:</strong> We track how you interact with our canvas and flows to improve the product.</li>
              <li><strong>Integration data:</strong> When you connect third-party APIs or social channels, we store the necessary access tokens securely.</li>
            </ul>
            <h2>How we use your information</h2>
            <p>
              We use the information we collect from all our services for the following purposes:
            </p>
            <ul>
              <li>Provide our services</li>
              <li>Maintain and improve our services</li>
              <li>Develop new services</li>
              <li>Provide personalized services, including content and ads</li>
            </ul>
            <h2>Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to fulfill the purposes described in this Privacy Policy, unless otherwise required by law.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@flowstage.com.
            </p>
          </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
