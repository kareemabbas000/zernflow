"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const pains = [
  "Drowning in unread DMs across five different apps.",
  "Support agents copy-pasting the same answers all day.",
  "Leads going cold because nobody replied in time.",
  "Developers spending weeks building basic chat logic."
]

const reliefs = [
  "One unified inbox for every single conversation.",
  "AI handles 80% of repetitive questions instantly.",
  "Automated routing ensures leads get immediate answers.",
  "Visual builder deploys complex flows in minutes."
]

export function MarketingBeforeAfter() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--marketing-deep)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Stop doing it the hard way.
          </h2>
          <p className="text-lg font-medium text-white/70 max-w-2xl mx-auto">
            The old way of managing customer conversations is slow, expensive, and frustrating. FlowStage changes the physics of support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
          {/* Before */}
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 lg:p-12 flex flex-col justify-center">
            <h3 className="font-bold text-xl mb-8 text-white/50 uppercase tracking-wider font-mono">
              Before FlowStage
            </h3>
            <div className="space-y-6">
              {pains.map((pain, idx) => (
                <div key={idx} className="flex items-start gap-4 text-white/70">
                  <XCircle className="w-6 h-6 shrink-0 mt-0.5 text-white/50" />
                  <p className="text-lg font-medium leading-tight">{pain}</p>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="bg-[var(--surface)] border-2 border-[var(--lime)] rounded-[28px] p-8 lg:p-12 flex flex-col justify-center shadow-2xl shadow-[var(--lime)]/10 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-[var(--lime)] text-[var(--bg)] font-bold px-4 py-1.5 rounded-full text-sm shadow-sm">
                The FlowStage Way
              </span>
            </div>
            <h3 className="font-bold text-xl mb-8 text-[var(--text-primary)] uppercase tracking-wider font-mono">
              After FlowStage
            </h3>
            <div className="space-y-6 mb-10">
              {reliefs.map((relief, idx) => (
                <div key={idx} className="flex items-start gap-4 text-[var(--text-primary)]">
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[var(--lime)]" />
                  <p className="text-lg font-bold leading-tight">{relief}</p>
                </div>
              ))}
            </div>
            
            <Button asChild size="lg" className="w-full h-14 rounded-full font-bold bg-[var(--text-primary)] hover:bg-[var(--surface-3)] text-[var(--bg)]">
              <Link href="/register">Experience the relief <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
