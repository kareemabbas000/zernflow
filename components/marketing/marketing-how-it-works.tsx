"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  {
    id: "step-1",
    title: "1. Connect Channels",
    description: "Link WhatsApp, Instagram, or any channel with a single click.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
  },
  {
    id: "step-2",
    title: "2. Build Logic",
    description: "Drag and drop to map out your conversation flow visually.",
    video: "https://cdn.dribbble.com/userupload/12555306/file/original-3e1ed5bbfce57b0fb84e8a3a22af425c.mp4",
  },
  {
    id: "step-3",
    title: "3. Deploy & Relax",
    description: "Hit publish and watch the automated conversations roll in.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
  }
]

export function MarketingHowItWorks() {
  const [activeStep, setActiveStep] = React.useState(steps[0].id)

  const activeContent = steps.find(s => s.id === activeStep)

  return (
    <section className="py-24 bg-[var(--surface-2)]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--ink)] mb-4">
            How it works
          </h2>
          <p className="text-lg text-[var(--ink-2)] font-medium max-w-xl mx-auto">
            From empty canvas to fully automated support in minutes, not months.
          </p>
        </div>

        {/* Swipeable Tabs (Mobile) / Pills (Desktop) */}
        <div className="flex overflow-x-auto pb-4 mb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:justify-center hide-scrollbar">
          <div className="flex gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  activeStep === step.id
                    ? "bg-[var(--ink)] text-white shadow-md"
                    : "bg-white text-[var(--ink-2)] border border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Video Panel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[28px] border border-[var(--border)] p-2 lg:p-4 shadow-sm relative overflow-hidden">
            <div className="aspect-video relative rounded-[20px] overflow-hidden bg-[var(--surface-2)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={activeContent?.video} type="video/mp4" />
                  </video>
                  <div className="absolute bottom-6 left-6 right-6 bg-[var(--ink)]/80 backdrop-blur-md rounded-xl p-4 text-white">
                    <p className="font-bold">{activeContent?.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
