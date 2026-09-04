"use client"

import * as React from "react"
import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MarketingPricing() {
  const [isAnnual, setIsAnnual] = React.useState(true)

  return (
    <section className="py-24 lg:py-32 bg-[var(--bg)] border-y border-[var(--border)]" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4">
            Fair pricing for growing teams.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-xl mx-auto mb-8">
            Start for free. Scale when you need to. No hidden fees.
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-[var(--text-primary)] transition-colors focus:outline-none"
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-[var(--bg)] transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold ${isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              Annual <span className="text-[var(--success)] ml-1 bg-[var(--success-soft)] px-2 py-0.5 rounded-md text-xs">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {/* Free Tier */}
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
            <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">Starter</h3>
            <p className="text-[var(--text-muted)] text-sm font-medium mb-6">For individuals and small side projects.</p>
            <div className="mb-6">
              <span className="text-5xl font-black text-[var(--text-primary)]">$0</span>
              <span className="text-[var(--text-muted)] font-medium">/mo</span>
            </div>
            <Button asChild variant="outline" className="w-full rounded-full h-12 font-bold mb-8 text-[var(--text-primary)] hover:bg-[var(--surface-2)]">
              <Link href="/register">Start for free</Link>
            </Button>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> 1 Team Member
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> 1,000 Messages / month
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> Basic Visual Builder
              </li>
            </ul>
          </div>

          {/* Pro Tier (Dominant) */}
          <div className="rounded-[28px] border-2 border-[var(--marketing-deep)] bg-[var(--marketing-deep)] text-white p-8 shadow-2xl scale-105 relative z-10">
            <div className="absolute top-0 right-6 -translate-y-1/2">
              <span className="bg-[var(--lime)] text-[#0E0E13] font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">
                Most Popular
              </span>
            </div>
            <h3 className="font-bold text-xl mb-2 text-white">Professional</h3>
            <p className="text-white/70 text-sm font-medium mb-6">For growing businesses scaling support.</p>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">${isAnnual ? '49' : '59'}</span>
              <span className="text-white/70 font-medium">/mo</span>
            </div>
            <Button asChild className="w-full rounded-full h-12 font-bold mb-8 bg-white text-[#0E0E13] hover:bg-gray-100">
              <Link href="/register">Start 14-day free trial</Link>
            </Button>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check className="w-5 h-5 text-[var(--lime)]" /> Up to 5 Team Members
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check className="w-5 h-5 text-[var(--lime)]" /> 50,000 Messages / month
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check className="w-5 h-5 text-[var(--lime)]" /> Advanced AI Copilot
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                <Check className="w-5 h-5 text-[var(--lime)]" /> Analytics & Reports
              </li>
            </ul>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
            <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">Enterprise</h3>
            <p className="text-[var(--text-muted)] text-sm font-medium mb-6">Custom limits and dedicated support.</p>
            <div className="mb-6">
              <span className="text-5xl font-black text-[var(--text-primary)]">Custom</span>
            </div>
            <Button asChild variant="outline" className="w-full rounded-full h-12 font-bold mb-8 text-[var(--text-primary)] hover:bg-[var(--surface-2)]">
              <Link href="/contact">Contact Sales</Link>
            </Button>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> Unlimited Members
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> Custom Message Volume
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> Dedicated Success Manager
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)]">
                <Check className="w-5 h-5 text-[var(--text-primary)]" /> Custom Integrations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
