"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Workflow, Cpu, Globe, BarChart3 } from "lucide-react"

const features = [
  {
    id: "visual-studio",
    eyebrow: "01. VISUAL STUDIO",
    heading: "Build flows without breaking a sweat",
    copy: "Drag and drop triggers, conditions, and actions onto an infinite canvas. Complex logic feels like playing with blocks.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
    accent: "bg-[var(--brand)]",
    reversed: false,
    icon: <Workflow className="w-5 h-5" />
  },
  {
    id: "ai-copilot",
    eyebrow: "02. NATIVE AI COPILOT",
    heading: "Let AI handle the busywork",
    copy: "Embed LLM nodes directly in your flows. Categorize intents, summarize long threads, or generate draft replies on autopilot.",
    video: "https://cdn.dribbble.com/userupload/12555306/file/original-3e1ed5bbfce57b0fb84e8a3a22af425c.mp4",
    accent: "bg-[var(--lilac)]",
    reversed: true,
    icon: <Cpu className="w-5 h-5" />
  },
  {
    id: "omnichannel",
    eyebrow: "03. OMNICHANNEL",
    heading: "One inbox for every channel",
    copy: "WhatsApp, Instagram, SMS, and Email flowing into a single unified view. Respond faster without switching tabs.",
    video: "https://cdn.dribbble.com/userupload/11843075/file/original-b9a3dc50c05df145455d37651c6c5188.mp4",
    accent: "bg-[var(--lime)]",
    reversed: false,
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: "analytics",
    eyebrow: "04. DEEP ANALYTICS",
    heading: "Insight over noise",
    copy: "Stop drowning in spreadsheets. See clear trends, conversion metrics, and AI-generated plain text explanations of what changed.",
    video: "https://cdn.dribbble.com/userupload/12555306/file/original-3e1ed5bbfce57b0fb84e8a3a22af425c.mp4",
    accent: "bg-[var(--butter)]",
    reversed: true,
    icon: <BarChart3 className="w-5 h-5" />
  }
]

export function MarketingFeatures() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--paper)] overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">
        {features.map((feature, idx) => (
          <div 
            key={feature.id} 
            className={`flex flex-col ${feature.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-[var(--ink-3)]">
                <span className={`p-1.5 rounded-md text-white ${feature.accent}`}>
                  {feature.icon}
                </span>
                {feature.eyebrow}
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--ink)]">
                {feature.heading}
              </h2>
              <p className="text-lg md:text-xl text-[var(--ink-2)] font-medium leading-relaxed max-w-lg">
                {feature.copy}
              </p>
            </div>

            {/* Video Panel */}
            <div className="flex-1 relative w-full aspect-square md:aspect-video lg:aspect-square max-w-2xl">
              {/* Bleeding Accent Block */}
              <div className={`absolute top-[10%] bottom-[-10%] ${feature.reversed ? 'right-[-50vw] left-[10%]' : 'left-[-50vw] right-[10%]'} ${feature.accent} opacity-20 rounded-3xl -z-10`} />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full h-full relative rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl"
              >
                {/* Device Frame */}
                <div className="w-full h-full rounded-[20px] overflow-hidden bg-[var(--ink)] relative border border-[var(--border-strong)]">
                  <div className="absolute top-0 inset-x-0 h-6 bg-[var(--surface-2)] border-b border-[var(--border-strong)] flex items-center px-4 gap-1.5 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/80" />
                  </div>
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover pt-6 opacity-80"
                  >
                    <source src={feature.video} type="video/mp4" />
                  </video>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
