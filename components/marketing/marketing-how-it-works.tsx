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
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-0 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--brand-soft)_0%,transparent_70%)] opacity-30" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
    
    <div className="relative z-10 w-full h-full flex items-center justify-center scale-[0.6] sm:scale-75 md:scale-100">
      
      {/* Central Hub */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px var(--brand)", "0 0 40px var(--brand)", "0 0 0px var(--brand)"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] border-4 border-[var(--bg)] shadow-[0_0_50px_var(--brand)] flex items-center justify-center absolute z-30"
      >
        <Workflow className="w-12 h-12 text-white" />
      </motion.div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px' }}>
        {[
          { x1: 150, y1: 150 }, { x1: 450, y1: 150 }, { x1: 150, y1: 450 }, { x1: 450, y1: 450 }
        ].map((pos, i) => (
          <g key={i}>
            <motion.line 
              x1={pos.x1} y1={pos.y1} x2="300" y2="300" 
              stroke="var(--border-strong)" strokeWidth="4" strokeDasharray="8 8"
            />
            <motion.circle 
              cx={pos.x1} cy={pos.y1} r="4" fill="var(--brand)"
              animate={{ 
                cx: [pos.x1, 300], 
                cy: [pos.y1, 300],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeIn" }}
            />
          </g>
        ))}
      </svg>

      {/* Orbiting Channel Nodes */}
      <motion.div 
        animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        className="absolute z-20" style={{ transform: 'translate(-150px, -150px)' }}
      >
        <div className="w-24 h-24 rounded-3xl bg-[#25D366] border-4 border-[var(--bg)] shadow-2xl flex items-center justify-center">
          <WhatsAppIcon className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute z-20" style={{ transform: 'translate(150px, -150px)' }}
      >
        <div className="w-24 h-24 rounded-3xl bg-[#E1306C] border-4 border-[var(--bg)] shadow-2xl flex items-center justify-center">
          <InstagramIcon className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        className="absolute z-20" style={{ transform: 'translate(-150px, 150px)' }}
      >
        <div className="w-24 h-24 rounded-3xl bg-[#1877F2] border-4 border-[var(--bg)] shadow-2xl flex items-center justify-center">
          <FacebookIcon className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, delay: 3 }}
        className="absolute z-20" style={{ transform: 'translate(150px, 150px)' }}
      >
        <div className="w-24 h-24 rounded-3xl bg-[#0088cc] border-4 border-[var(--bg)] shadow-2xl flex items-center justify-center">
          <TelegramIcon className="w-12 h-12 text-white" />
        </div>
      </motion.div>
    </div>
  </div>
);

export const MockupLogic = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden p-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
    
    <div className="relative z-10 w-full h-full flex items-center justify-center scale-75 md:scale-100">
      
      {/* Zoomed in Node Graph */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        
        {/* Router Node - Huge */}
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-80 bg-[var(--bg)]/90 backdrop-blur-2xl rounded-[32px] border-4 border-[var(--border-strong)] shadow-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--border)]/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center shadow-inner">
              <Workflow className="w-7 h-7 text-[var(--text-primary)]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Condition</div>
              <div className="text-xl font-black text-[var(--text-primary)]">User VIP Status</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-[var(--surface-2)] border-2 border-[var(--brand)] rounded-xl p-3 flex justify-between items-center shadow-[0_0_15px_var(--brand)]/10">
              <span className="font-bold text-[var(--text-primary)]">is_vip == true</span>
              <div className="w-6 h-6 rounded-full bg-[var(--brand)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="bg-[var(--surface-2)] border-2 border-[var(--border)] rounded-xl p-3 flex justify-between items-center opacity-60">
              <span className="font-bold text-[var(--text-primary)]">is_vip == false</span>
              <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[var(--surface)]" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Massive Connection Lines */}
        <div className="flex w-[400px] justify-between relative mt-2">
           <svg className="absolute w-[400px] h-[100px] top-0 left-0" style={{ zIndex: -1 }}>
             <motion.path 
               d="M 200 0 C 200 60, 50 40, 50 100" 
               stroke="var(--brand)" strokeWidth="6" fill="none"
               initial={{ strokeDasharray: "10 10" }}
               animate={{ strokeDashoffset: [0, -100] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
             <path d="M 200 0 C 200 60, 350 40, 350 100" stroke="var(--border-strong)" strokeWidth="6" fill="none" />
           </svg>
        </div>
        
        {/* Action Nodes */}
        <div className="flex gap-20 mt-[100px] relative w-[480px] justify-between">
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
            className="w-56 bg-[var(--bg)]/90 backdrop-blur-2xl rounded-[32px] border-4 border-[var(--brand)] shadow-[0_0_40px_var(--brand)]/20 p-6 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand)] text-white flex items-center justify-center mb-4 shadow-lg"><Zap className="w-8 h-8"/></div>
            <div className="text-lg font-black text-[var(--text-primary)] mb-1">Priority Queue</div>
            <div className="text-xs font-bold text-[var(--text-secondary)]">Route to top agent</div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
            className="w-56 bg-[var(--bg)]/90 backdrop-blur-2xl rounded-[32px] border-4 border-[var(--border)] shadow-xl p-6 flex flex-col items-center text-center opacity-75"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center mb-4"><Cpu className="w-8 h-8"/></div>
            <div className="text-lg font-black text-[var(--text-primary)] mb-1">AI Gen-Reply</div>
            <div className="text-xs font-bold text-[var(--text-secondary)]">Standard support</div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

export const MockupDeploy = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex flex-col items-center justify-center p-0 relative overflow-hidden">
    
    {/* Pulsating Radar Background */}
    <motion.div 
       animate={{ scale: [1, 2, 3], opacity: [0.8, 0.2, 0] }}
       transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
       className="absolute w-[300px] h-[300px] border-[10px] border-[var(--success)] rounded-full z-0"
    />
    <motion.div 
       animate={{ scale: [1, 2, 3], opacity: [0.8, 0.2, 0] }}
       transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeOut" }}
       className="absolute w-[300px] h-[300px] border-[10px] border-[var(--success)] rounded-full z-0"
    />
    
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--success-soft)_0%,transparent_80%)] opacity-30 z-0" />
    
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="bg-[var(--bg)]/80 backdrop-blur-3xl rounded-[40px] border-2 border-[var(--border)] p-10 shadow-2xl w-full max-w-[420px] relative z-10 flex flex-col items-center text-center"
    >
      <div className="w-full flex justify-between items-center mb-8">
         <div className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Production</div>
         <div className="px-3 py-1 rounded-full bg-[var(--success-soft)] text-[var(--success)] text-xs font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" /> LIVE
         </div>
      </div>
      
      {/* Massive Toggle */}
      <div className="w-48 h-24 bg-[var(--success)] rounded-full p-2 mb-8 shadow-inner relative cursor-pointer group">
         <div className="absolute inset-0 rounded-full shadow-[0_0_50px_var(--success)] opacity-50 group-hover:opacity-100 transition-opacity" />
         <motion.div 
           layout
           className="w-20 h-20 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center ml-auto relative z-10"
         >
           <Check className="w-10 h-10 text-[var(--success)]" />
         </motion.div>
      </div>

      <div className="space-y-2 mb-8 w-full">
         <div className="text-5xl font-display font-black text-[var(--text-primary)]">14,293</div>
         <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Conversations Auto-Handled</div>
      </div>
      
      <div className="w-full bg-[var(--surface-2)] rounded-2xl h-3 overflow-hidden shadow-inner">
         <motion.div 
           initial={{ width: "0%" }}
           animate={{ width: "85%" }}
           transition={{ duration: 2, ease: "easeOut" }}
           className="h-full bg-gradient-to-r from-[var(--success)] to-[#25D366]"
         />
      </div>
      <div className="w-full flex justify-between text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">
        <span>0%</span>
        <span className="text-[var(--success)]">Server Load: 85%</span>
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
