"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Plus, Check, Zap, Play, Workflow, Cpu } from "lucide-react"

// Authentic Social Icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.98-10.98a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

export const MockupChannels = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--brand-soft)_0%,transparent_70%)] opacity-30" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
    
    <div className="relative z-10 w-full max-w-[280px] aspect-square flex items-center justify-center">
      
      {/* Central Hub */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px var(--brand)", "0 0 20px var(--brand)", "0 0 0px var(--brand)"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] border-2 border-[var(--bg)] shadow-[0_0_20px_var(--brand)] flex items-center justify-center absolute z-30"
      >
        <Workflow className="w-6 h-6 text-white" />
      </motion.div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {[
          { x1: 40, y1: 40 }, { x1: 240, y1: 40 }, { x1: 40, y1: 240 }, { x1: 240, y1: 240 }
        ].map((pos, i) => (
          <g key={i}>
            <motion.line 
              x1={pos.x1} y1={pos.y1} x2="140" y2="140" 
              stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="4 4"
            />
            <motion.circle 
              cx={pos.x1} cy={pos.y1} r="3" fill="var(--brand)"
              animate={{ 
                cx: [pos.x1, 140], 
                cy: [pos.y1, 140],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeIn" }}
            />
          </g>
        ))}
      </svg>

      {/* Orbiting Channel Nodes */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        className="absolute z-20 left-4 top-4"
      >
        <div className="w-12 h-12 rounded-xl bg-[#25D366] border-2 border-[var(--bg)] shadow-xl flex items-center justify-center">
          <WhatsAppIcon className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute z-20 right-4 top-4"
      >
        <div className="w-12 h-12 rounded-xl bg-[#E1306C] border-2 border-[var(--bg)] shadow-xl flex items-center justify-center">
          <InstagramIcon className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        className="absolute z-20 left-4 bottom-4"
      >
        <div className="w-12 h-12 rounded-xl bg-[#1877F2] border-2 border-[var(--bg)] shadow-xl flex items-center justify-center">
          <FacebookIcon className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, delay: 3 }}
        className="absolute z-20 right-4 bottom-4"
      >
        <div className="w-12 h-12 rounded-xl bg-[#0088cc] border-2 border-[var(--bg)] shadow-xl flex items-center justify-center">
          <TelegramIcon className="w-6 h-6 text-white" />
        </div>
      </motion.div>
    </div>
  </div>
);

export const MockupLogic = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden p-4">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
    
    <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
      
      {/* Router Node */}
      <motion.div 
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full bg-[var(--bg)]/90 backdrop-blur-md rounded-2xl border-2 border-[var(--border-strong)] shadow-lg p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center">
            <Workflow className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Condition</div>
            <div className="text-sm font-black text-[var(--text-primary)]">User VIP Status</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="bg-[var(--surface-2)] border border-[var(--brand)] rounded-lg p-2 flex justify-between items-center">
            <span className="font-bold text-[var(--text-primary)] text-xs">is_vip == true</span>
            <div className="w-4 h-4 rounded-full bg-[var(--brand)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 flex justify-between items-center opacity-60">
            <span className="font-bold text-[var(--text-primary)] text-xs">is_vip == false</span>
            <div className="w-4 h-4 rounded-full bg-[var(--border)]" />
          </div>
        </div>
      </motion.div>
      
      <div className="w-full flex justify-between px-8 relative">
        <div className="w-px h-8 bg-[var(--border-strong)]" />
        <div className="w-px h-8 bg-[var(--border-strong)] opacity-30" />
        <div className="absolute top-4 left-8 right-8 h-px bg-[var(--border-strong)] opacity-30" />
      </div>
      
      {/* Action Nodes */}
      <div className="flex w-full gap-4">
        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          className="flex-1 bg-[var(--bg)]/90 backdrop-blur-md rounded-xl border-2 border-[var(--brand)] shadow-[0_0_20px_var(--brand)]/10 p-3 flex flex-col items-center text-center"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center mb-2 shadow-sm"><Zap className="w-4 h-4"/></div>
          <div className="text-xs font-black text-[var(--text-primary)]">Priority</div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
          className="flex-1 bg-[var(--bg)]/90 backdrop-blur-md rounded-xl border-2 border-[var(--border)] shadow-sm p-3 flex flex-col items-center text-center opacity-75"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center mb-2"><Cpu className="w-4 h-4"/></div>
          <div className="text-xs font-black text-[var(--text-primary)]">AI Reply</div>
        </motion.div>
      </div>
    </div>
  </div>
);

export const MockupDeploy = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
    
    {/* Pulsating Radar Background */}
    <motion.div 
       animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
       transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
       className="absolute w-40 h-40 border-4 border-[var(--success)] rounded-full z-0"
    />
    <motion.div 
       animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
       transition={{ duration: 3, repeat: Infinity, delay: 1.5, ease: "easeOut" }}
       className="absolute w-40 h-40 border-4 border-[var(--success)] rounded-full z-0"
    />
    
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--success-soft)_0%,transparent_80%)] opacity-30 z-0" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="bg-[var(--bg)]/90 backdrop-blur-md rounded-2xl border border-[var(--border)] p-6 shadow-xl w-full max-w-[280px] relative z-10 flex flex-col items-center text-center"
    >
      <div className="w-full flex justify-between items-center mb-6">
         <div className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Production</div>
         <div className="px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] text-[10px] font-bold flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> LIVE
         </div>
      </div>
      
      {/* Massive Toggle */}
      <div className="w-24 h-12 bg-[var(--success)] rounded-full p-1 mb-6 shadow-inner relative cursor-pointer group">
         <div className="absolute inset-0 rounded-full shadow-[0_0_20px_var(--success)] opacity-50 group-hover:opacity-100 transition-opacity" />
         <motion.div 
           layout
           className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center ml-auto relative z-10"
         >
           <Check className="w-5 h-5 text-[var(--success)]" />
         </motion.div>
      </div>

      <div className="space-y-1 mb-6 w-full">
         <div className="text-3xl font-display font-black text-[var(--text-primary)]">14,293</div>
         <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Auto-Handled</div>
      </div>
      
      <div className="w-full bg-[var(--surface-2)] rounded-full h-2 overflow-hidden shadow-inner">
         <motion.div 
           initial={{ width: "0%" }}
           animate={{ width: "85%" }}
           transition={{ duration: 2, ease: "easeOut" }}
           className="h-full bg-[var(--success)]"
         />
      </div>
      <div className="w-full flex justify-between text-[8px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">
        <span>0%</span>
        <span className="text-[var(--success)]">Load: 85%</span>
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
                  <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 bg-[var(--overlay-scrim)] backdrop-blur-overlay rounded-[14px] py-2.5 px-4 md:py-3 md:px-5 text-[var(--text-on-brand)] z-50 border border-[var(--border-subtle)] shadow-xl shadow-black/20">
                    <p className="font-bold text-xs md:text-sm text-center md:text-left">{activeContent?.description}</p>
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
