"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-slate-400">Start for free, upgrade when you need more power.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 flex flex-col backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="text-4xl font-extrabold mb-6">$0<span className="text-lg font-normal text-slate-400">/mo</span></div>
            <p className="text-sm text-slate-400 mb-8">Perfect for exploring FlowStage capabilities.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-emerald-400" />
                <span>1 Team Member</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-emerald-400" />
                <span>100 Conversations/mo</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-emerald-400" />
                <span>Basic Flow Builder</span>
              </li>
            </ul>
            
            <Link href="/register" className="w-full text-center py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-semibold">
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-[2rem] border-2 border-purple-500 bg-gradient-to-b from-purple-500/10 to-transparent p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2 text-purple-400">Professional</h3>
            <div className="text-4xl font-extrabold mb-6">$49<span className="text-lg font-normal text-slate-400">/mo</span></div>
            <p className="text-sm text-slate-400 mb-8">For growing teams and serious automation.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-purple-400" />
                <span>Up to 5 Team Members</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-purple-400" />
                <span>Unlimited Channels</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-purple-400" />
                <span>Advanced AI Copilot</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-purple-400" />
                <span>Priority Support</span>
              </li>
            </ul>
            
            <Link href="/register" className="w-full text-center py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold text-white">
              Start 14-Day Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 flex flex-col backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="text-4xl font-extrabold mb-6">Custom</div>
            <p className="text-sm text-slate-400 mb-8">Dedicated infrastructure and custom integrations.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-blue-400" />
                <span>Unlimited Team Members</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-blue-400" />
                <span>Dedicated Success Manager</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-blue-400" />
                <span>White-label Options</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="h-5 w-5 text-blue-400" />
                <span>SSO & Custom SLA</span>
              </li>
            </ul>
            
            <Link href="/contact" className="w-full text-center py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-semibold">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
