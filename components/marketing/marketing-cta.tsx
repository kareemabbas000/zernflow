"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MarketingCTA() {
  return (
    <section className="bg-gradient-to-r from-[var(--brand)] via-[var(--brand-hover)] to-[var(--lilac)] py-32 text-center relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight text-white mb-8 leading-[1.1]">
          Ready to scale your conversations?
        </h2>
        <Button asChild size="lg" className="h-16 px-10 rounded-full font-bold text-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg)] shadow-xl shadow-[var(--text-primary)]/20 transition-transform hover:scale-105">
          <Link href="/register">
            Get started for free <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
