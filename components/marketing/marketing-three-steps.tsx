"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MockupChannels, MockupLogic, MockupDeploy } from "./marketing-how-it-works"

const steps = [
  {
    num: "01",
    title: "Link your accounts",
    desc: "Connect your existing social and messaging channels in one click.",
    mockup: <MockupChannels />
  },
  {
    num: "02",
    title: "Draw your logic",
    desc: "Use the visual builder to map exactly how conversations should flow.",
    mockup: <MockupLogic />
  },
  {
    num: "03",
    title: "Go live instantly",
    desc: "Hit publish. FlowStage instantly takes over routine conversations.",
    mockup: <MockupDeploy />
  }
]

export function MarketingThreeSteps() {
  return (
    <section className="py-24 bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--ink)]">
            Three steps to live.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="text-6xl font-mono font-black text-[var(--border-strong)] mb-6 group-hover:text-[var(--brand)] transition-colors">
                {step.num}
              </div>
              <div className="w-full aspect-square rounded-[24px] border border-[var(--border)] overflow-hidden bg-[var(--surface)] mb-6 shadow-sm p-1">
                <div className="w-full h-full rounded-[18px] overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full scale-[0.65] origin-center -m-12">
                    {step.mockup}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-xl text-[var(--ink)] mb-2">{step.title}</h3>
              <p className="text-[var(--ink-3)] font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
