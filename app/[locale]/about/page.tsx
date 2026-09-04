"use client";

import * as React from "react"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Sparkles, Zap, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-[var(--ink-2)] mb-8 shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--brand)]" />
            <span>Our Mission</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-8">
            Making automation feel <span className="text-[var(--brand)]">human.</span>
          </h1>
          <p className="text-xl text-[var(--ink-2)] font-medium max-w-2xl mx-auto leading-relaxed">
            We started FlowStage because we were tired of seeing support teams drowning in messages while developers spent months building basic chatbots. We believed there had to be a better way.
          </p>
        </div>

        {/* Values Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-32">
          <div className="bg-white rounded-[28px] p-10 border border-[var(--border)] shadow-sm">
            <div className="w-14 h-14 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center text-[var(--brand)] mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-[var(--ink)]">Speed is a feature</h3>
            <p className="text-[var(--ink-3)] font-medium leading-relaxed">
              We optimise for the fastest time to value. You shouldn't need a PhD to deploy a conversation flow.
            </p>
          </div>
          
          <div className="bg-white rounded-[28px] p-10 border border-[var(--border)] shadow-sm">
            <div className="w-14 h-14 bg-[var(--coral)]/10 rounded-2xl flex items-center justify-center text-[var(--coral)] mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-[var(--ink)]">Design matters</h3>
            <p className="text-[var(--ink-3)] font-medium leading-relaxed">
              Enterprise software doesn't have to be ugly. We believe calm, beautiful tools make for happier teams.
            </p>
          </div>

          <div className="bg-white rounded-[28px] p-10 border border-[var(--border)] shadow-sm">
            <div className="w-14 h-14 bg-[var(--success-soft)] rounded-2xl flex items-center justify-center text-[var(--success)] mb-6">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-[var(--ink)]">Trust is everything</h3>
            <p className="text-[var(--ink-3)] font-medium leading-relaxed">
              When you handle customer messages, you need 99.99% uptime. We build for resilience from day one.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-5xl mx-auto bg-[var(--surface-2)] rounded-[40px] p-12 lg:p-24 text-center border border-[var(--border)]">
          <h2 className="font-display text-4xl font-black mb-6">Built for the long term.</h2>
          <p className="text-lg text-[var(--ink-2)] font-medium max-w-2xl mx-auto leading-relaxed">
            We're a small, independent team of designers and engineers. We have no external pressure to bloat our product with trendy features. We only build what makes your customer operations faster, calmer, and more effective.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
