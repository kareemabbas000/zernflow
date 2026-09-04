"use client"

import * as React from "react"
import { motion } from "framer-motion"

const steps = [
  {
    num: "01",
    title: "Link your accounts",
    desc: "Connect your existing social and messaging channels in one click.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
  },
  {
    num: "02",
    title: "Draw your logic",
    desc: "Use the visual builder to map exactly how conversations should flow.",
    video: "https://cdn.dribbble.com/userupload/12555306/file/original-3e1ed5bbfce57b0fb84e8a3a22af425c.mp4",
  },
  {
    num: "03",
    title: "Go live instantly",
    desc: "Hit publish. FlowStage instantly takes over routine conversations.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
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
                <div className="w-full h-full rounded-[18px] overflow-hidden">
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <source src={step.video} type="video/mp4" />
                  </video>
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
