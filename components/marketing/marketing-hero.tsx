"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

const floatingCards = [
  {
    id: 1,
    content: "Hey, is my order shipped?",
    sender: "Alex M.",
    time: "Just now",
    color: "bg-white",
    icon: "bg-[var(--success)]",
    position: "left-[10%] top-[20%]",
    delay: 0,
    yOffset: 20
  },
  {
    id: 2,
    content: "Booked a demo for tomorrow! 🎉",
    sender: "Sarah J.",
    time: "2m ago",
    color: "bg-white",
    icon: "bg-[var(--brand)]",
    position: "right-[15%] top-[10%]",
    delay: 1.2,
    yOffset: 25
  },
  {
    id: 3,
    content: "Can I upgrade my plan?",
    sender: "David R.",
    time: "5m ago",
    color: "bg-white",
    icon: "bg-[var(--warning)]",
    position: "left-[5%] bottom-[20%]",
    delay: 0.8,
    yOffset: 15
  },
  {
    id: 4,
    content: "Thanks for the quick reply!",
    sender: "Emily T.",
    time: "10m ago",
    color: "bg-white",
    icon: "bg-[var(--lilac)]",
    position: "right-[5%] bottom-[25%]",
    delay: 2,
    yOffset: 30
  }
]

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[var(--paper)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-40 blur-[100px] bg-gradient-to-tr from-[var(--butter)] via-[var(--lilac)] to-[var(--lime)] rounded-full mix-blend-multiply pointer-events-none" />
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] opacity-30 blur-[120px] bg-gradient-to-tl from-[var(--brand-soft)] to-[var(--coral)] rounded-full mix-blend-multiply pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-[var(--ink-2)] mb-8 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-[var(--brand)]" />
            <span>Meet FlowStage 2.0</span>
          </motion.div>

          {/* Headline (Max 6 Words) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-6"
          >
            Automate conversations. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)]">Grow revenue faster.</span>
          </motion.h1>

          {/* Subcopy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-[var(--ink-2)] font-medium mb-10 max-w-2xl leading-relaxed"
          >
            Build visual workflows, deploy AI copilots, and manage every channel from one powerful inbox.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="h-16 px-10 rounded-full font-bold text-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-xl shadow-[var(--brand)]/20 w-full sm:w-auto transition-all hover:scale-105">
              <Link href="/register">Start for free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-medium text-[var(--ink-3)] flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[var(--success)]" /> No credit card required
              </span>
              <span className="text-[var(--border-strong)]">|</span>
              <Link href="/login" className="text-sm font-bold text-[var(--ink)] hover:text-[var(--brand)] underline decoration-2 decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--brand)] transition-all">
                Sign in to your account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Cards (Hidden on mobile for cleaner hero) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none -z-0">
          {floatingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 + card.delay, ease: "easeOut" }}
              className={`absolute ${card.position}`}
            >
              <motion.div
                animate={{ y: [0, -card.yOffset, 0] }}
                transition={{
                  duration: 6 + card.delay * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: card.delay,
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl shadow-black/5 border border-[var(--border)] ${card.color} backdrop-blur-md min-w-[240px] pointer-events-auto hover:-translate-y-1 transition-transform cursor-default`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${card.icon}`}>
                  {card.sender.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[var(--ink)]">{card.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] font-medium text-[var(--ink-3)]">{card.sender}</span>
                    <span className="text-[10px] font-semibold text-[var(--ink-3)]">{card.time}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
