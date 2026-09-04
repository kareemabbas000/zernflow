"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Plus, Check, Zap, Play, Workflow, Cpu } from "lucide-react"

export const MockupChannels = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-4 md:p-8 relative">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
    <div className="w-full max-w-[320px] bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden relative z-10 flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
        <div className="text-xs font-bold text-[var(--text-primary)]">Integrations Hub</div>
        <div className="px-2 py-1 bg-[var(--brand-soft)] text-[var(--brand)] text-[9px] rounded font-bold uppercase tracking-wider">3 Active</div>
      </div>
      <div className="p-3 grid grid-cols-2 gap-3">
        {[
          { name: "WhatsApp API", icon: <Globe className="w-4 h-4 text-[#25D366]" />, status: "Connected", bg: "bg-[#25D366]/10 border-[#25D366]/20" },
          { name: "Instagram DM", icon: <Globe className="w-4 h-4 text-[#E1306C]" />, status: "Connected", bg: "bg-[#E1306C]/10 border-[#E1306C]/20" },
          { name: "OpenAI API", icon: <Zap className="w-4 h-4 text-[var(--lilac)]" />, status: "Connected", bg: "bg-[var(--lilac-soft)] border-[var(--lilac)]/20" },
          { name: "Shopify", icon: <Globe className="w-4 h-4 text-[#95BF47]" />, status: "Connect", bg: "bg-[var(--surface-2)] border-[var(--border)] opacity-60" },
        ].map((ch, i) => (
          <motion.div 
            key={ch.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-lg border p-3 flex flex-col gap-2 relative ${ch.bg}`}
          >
            {ch.status === "Connected" && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_5px_var(--success)]" />
            )}
            {ch.icon}
            <div>
              <div className="text-[10px] font-bold text-[var(--text-primary)]">{ch.name}</div>
              <div className={`text-[8px] font-bold uppercase mt-0.5 ${ch.status === 'Connected' ? 'text-[var(--text-primary)] opacity-70' : 'text-[var(--brand)]'}`}>
                {ch.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export const MockupLogic = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
    
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      {/* Node Graph Editor Mockup */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Webhook Node */}
        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-40 bg-[var(--surface)] rounded-lg border border-[var(--brand)] shadow-lg p-2 flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[var(--brand)] text-white"><Workflow className="w-3 h-3"/></div>
          <div>
            <div className="text-[9px] font-bold text-[var(--text-primary)]">Trigger: Webhook</div>
            <div className="text-[7px] text-[var(--text-secondary)]">Wait for message</div>
          </div>
        </motion.div>
        
        <div className="w-px h-6 bg-[var(--border-strong)]" />
        
        {/* Router Node */}
        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          className="w-32 bg-[var(--surface)] rounded-lg border border-[var(--border-strong)] shadow-lg p-2 text-center"
        >
          <div className="text-[9px] font-bold text-[var(--text-primary)]">Router</div>
          <div className="text-[7px] text-[var(--text-muted)] mt-1">If Intent == "Pricing"</div>
        </motion.div>
        
        <div className="flex w-32 justify-between">
          <div className="w-px h-6 bg-[var(--border-strong)] -rotate-45 transform origin-top left-4 relative" />
          <div className="w-px h-6 bg-[var(--border-strong)] rotate-45 transform origin-top right-4 relative" />
        </div>
        
        <div className="flex gap-4">
          <motion.div 
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
            className="w-24 bg-[var(--surface)] rounded-lg border border-[var(--lilac)] shadow-lg p-2 text-center"
          >
            <Cpu className="w-4 h-4 text-[var(--lilac)] mx-auto mb-1"/>
            <div className="text-[8px] font-bold text-[var(--text-primary)]">AI Generate</div>
          </motion.div>
          <motion.div 
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
            className="w-24 bg-[var(--surface)] rounded-lg border border-[var(--success)] shadow-lg p-2 text-center"
          >
            <Check className="w-4 h-4 text-[var(--success)] mx-auto mb-1"/>
            <div className="text-[8px] font-bold text-[var(--text-primary)]">Send Reply</div>
          </motion.div>
        </div>
      </div>
      
      {/* Sidebar Tool panel */}
      <div className="absolute right-4 top-4 bottom-4 w-24 bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-xl flex flex-col gap-2 p-2 hidden sm:flex">
        <div className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 px-1">Nodes</div>
        {['AI Agent', 'HTTP Request', 'Delay', 'Send SMS'].map(n => (
          <div key={n} className="bg-[var(--surface-2)] rounded border border-[var(--border)] py-1.5 px-2 text-[8px] font-bold text-[var(--text-secondary)] text-center cursor-pointer hover:border-[var(--brand)]">{n}</div>
        ))}
      </div>
    </div>
  </div>
);

export const MockupDeploy = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <div className="absolute w-[300px] h-[300px] bg-[var(--success)] opacity-10 blur-[80px] rounded-full" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-6 shadow-2xl w-full max-w-[280px] relative z-10"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="text-xs font-bold text-[var(--text-primary)]">Deployment Status</div>
        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center shrink-0">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>
        <div>
          <div className="text-lg font-display font-black text-[var(--text-primary)]">v2.4 Live</div>
          <div className="text-[10px] font-medium text-[var(--text-secondary)]">Deployed 2m ago by Alex</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-[var(--text-muted)]">Conversations handled</span>
          <span className="text-[var(--success)]">1,492 this hour</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-[var(--success)] to-[#25D366]"
          />
        </div>
      </div>
      
      <button className="w-full mt-6 bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors rounded-lg py-2 text-[10px] font-bold text-[var(--text-primary)] border border-[var(--border)] shadow-sm">
        View Live Logs
      </button>
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
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4">
            How it works
          </h2>
          <p className="text-lg text-[var(--text-secondary)] font-medium max-w-xl mx-auto">
            From empty canvas to fully automated support in minutes, not months.
          </p>
        </div>

        {/* Swipeable Tabs (Mobile) / Pills (Desktop) */}
        <div className="flex overflow-x-auto pb-4 mb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:justify-center hide-scrollbar">
          <div className="flex gap-2 min-w-max w-full sm:w-auto">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  activeStep === step.id
                    ? "bg-[var(--text-primary)] text-[var(--bg)] shadow-md"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Video Panel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--surface)] rounded-[32px] md:rounded-[40px] border border-[var(--border)] p-2 md:p-3 shadow-xl relative overflow-hidden">
            <div className="aspect-square md:aspect-video relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-[var(--surface-2)]">
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
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-[var(--overlay-scrim)] backdrop-blur-overlay rounded-2xl p-4 md:p-5 text-[var(--text-on-brand)] z-50 border border-[var(--border-subtle)] shadow-2xl shadow-[var(--marketing-deep)]/20">
                    <p className="font-bold text-sm md:text-base text-center md:text-left">{activeContent?.description}</p>
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
