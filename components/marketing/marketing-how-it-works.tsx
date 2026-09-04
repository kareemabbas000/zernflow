"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Plus, Check, Play, Zap, ArrowRight } from "lucide-react"

const MockupChannels = () => (
  <div className="w-full h-full bg-[var(--paper)] flex items-center justify-center p-8 relative">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
      {[
        { name: "WhatsApp", icon: <Globe className="w-6 h-6 text-[#25D366]" />, status: "Connected", bg: "bg-white" },
        { name: "Instagram", icon: <Globe className="w-6 h-6 text-[#E1306C]" />, status: "Connected", bg: "bg-white" },
        { name: "Email", icon: <Globe className="w-6 h-6 text-[var(--brand)]" />, status: "Connect", bg: "bg-[var(--surface-2)]" },
        { name: "SMS", icon: <Globe className="w-6 h-6 text-[var(--ink)]" />, status: "Connect", bg: "bg-[var(--surface-2)]" },
        { name: "Slack", icon: <Globe className="w-6 h-6 text-[#4A154B]" />, status: "Connect", bg: "bg-[var(--surface-2)]" },
      ].map((ch, i) => (
        <motion.div 
          key={ch.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`${ch.bg} border border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm relative overflow-hidden`}
        >
          {ch.status === "Connected" && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--success)]" />
          )}
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0">
            {ch.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">{ch.name}</h4>
            <p className={`text-xs font-medium mt-1 ${ch.status === 'Connected' ? 'text-[var(--success)]' : 'text-[var(--brand)]'}`}>
              {ch.status === 'Connected' ? (
                <span className="flex items-center gap-1 justify-center"><Check className="w-3 h-3" /> Connected</span>
              ) : (
                <span className="flex items-center gap-1 justify-center"><Plus className="w-3 h-3" /> Connect</span>
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const MockupLogic = () => (
  <div className="w-full h-full bg-[var(--surface-2)] flex items-center justify-center p-8 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    
    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm w-full max-w-[280px] flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-[var(--brand)]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--ink)]">Instagram DM</h4>
          <p className="text-xs text-[var(--ink-3)]">Trigger on new message</p>
        </div>
      </motion.div>

      <div className="w-0.5 h-8 bg-gradient-to-b from-[var(--border-strong)] to-[var(--lilac)] -my-4 relative z-0" />

      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white rounded-xl border border-[var(--lilac)] p-4 shadow-md w-full max-w-[280px] flex items-center gap-3 relative"
      >
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-[var(--border)] bg-white flex items-center justify-center shadow-sm z-10">
          <Plus className="w-3 h-3 text-[var(--ink-3)]" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-[var(--lilac-soft)] flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[var(--lilac)]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--ink)]">AI Reply (GPT-4)</h4>
          <p className="text-xs text-[var(--ink-3)]">Auto-draft response</p>
        </div>
      </motion.div>
    </div>
  </div>
);

const MockupDeploy = () => (
  <div className="w-full h-full bg-[var(--paper)] flex flex-col items-center justify-center p-8 relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-soft)]/50 to-transparent pointer-events-none" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="bg-white rounded-2xl border border-[var(--border)] p-8 shadow-xl text-center max-w-sm w-full relative z-10"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-[var(--success)]" />
      </div>
      <h3 className="text-xl font-black text-[var(--ink)] mb-2">Flow Published!</h3>
      <p className="text-sm text-[var(--ink-2)] font-medium mb-6">
        Your AI Copilot is now live on WhatsApp and Instagram.
      </p>
      
      <div className="bg-[var(--surface-2)] rounded-lg p-3 text-left">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-[var(--ink-3)] uppercase tracking-wider">Status</span>
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--success)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Active
          </span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--ink-3)] uppercase tracking-wider">Handled today</span>
          <span className="text-sm font-black text-[var(--ink)]">1,402 msgs</span>
        </div>
      </div>
    </motion.div>
  </div>
);

const steps = [
  {
    id: "step-1",
    title: "1. Connect Channels",
    description: "Link WhatsApp, Instagram, or any channel with a single click.",
    mockup: <MockupChannels />
  },
  {
    id: "step-2",
    title: "2. Build Logic",
    description: "Drag and drop to map out your conversation flow visually.",
    mockup: <MockupLogic />
  },
  {
    id: "step-3",
    title: "3. Deploy & Relax",
    description: "Hit publish and watch the automated conversations roll in.",
    mockup: <MockupDeploy />
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
                  {activeContent?.mockup}
                  <div className="absolute bottom-6 left-6 right-6 bg-[var(--ink)]/80 backdrop-blur-md rounded-xl p-4 text-white z-50">
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
