"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Link2, Sparkles, Rocket } from "lucide-react"

const MiniStep1 = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--brand-soft)_0%,transparent_60%)] opacity-50" />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="relative w-32 h-32 flex items-center justify-center"
    >
      <div className="absolute inset-0 border border-dashed border-[var(--brand)]/30 rounded-full" />
      {[0, 1, 2].map((i) => (
        <motion.div 
          key={i}
          className="absolute w-8 h-8 bg-[var(--surface)] border border-[var(--brand)] rounded-full flex items-center justify-center shadow-lg"
          style={{
            transform: `rotate(${i * 120}deg) translateY(-24px) rotate(-${i * 120}deg)`
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        >
           <Link2 className="w-4 h-4 text-[var(--brand)]" />
        </motion.div>
      ))}
      <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-hover)] rounded-full shadow-[0_0_20px_var(--brand)] flex items-center justify-center z-10 relative">
         <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
           <Link2 className="w-5 h-5 text-white" />
         </motion.div>
      </div>
    </motion.div>
  </div>
);

const MiniStep2 = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden">
     <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
     <div className="relative w-full flex flex-col items-center gap-4">
        <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }} className="w-16 h-8 bg-[var(--bg)] border border-[var(--border-strong)] rounded-lg shadow-md flex items-center justify-center">
          <div className="w-3 h-1 rounded-full bg-[var(--text-muted)]" />
        </motion.div>
        
        <div className="w-px h-8 bg-[var(--border)] relative overflow-hidden">
           <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-[var(--brand)] origin-top" />
        </div>
        
        <div className="flex gap-6">
           <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} className="w-12 h-8 bg-[var(--brand-soft)] border border-[var(--brand)] rounded-lg shadow-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--brand)]" />
           </motion.div>
           <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="w-12 h-8 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-sm" />
        </div>
     </div>
  </div>
);

const MiniStep3 = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--success-soft)_0%,transparent_70%)] opacity-30" />
    <motion.div 
      animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute w-20 h-20 border-2 border-[var(--success)] rounded-full"
    />
    <motion.div 
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="w-16 h-16 bg-gradient-to-br from-[var(--success)] to-[#25D366] rounded-2xl shadow-[0_0_30px_var(--success)] flex items-center justify-center z-10 border-2 border-[var(--bg)]"
    >
      <Rocket className="w-8 h-8 text-white" />
    </motion.div>
  </div>
);

const steps = [
  {
    num: "01",
    title: "Link your accounts",
    desc: "Connect your existing social and messaging channels in one click.",
    mockup: <MiniStep1 />
  },
  {
    num: "02",
    title: "Draw your logic",
    desc: "Use the visual builder to map exactly how conversations should flow.",
    mockup: <MiniStep2 />
  },
  {
    num: "03",
    title: "Go live instantly",
    desc: "Hit publish. FlowStage instantly takes over routine conversations.",
    mockup: <MiniStep3 />
  }
]

export function MarketingThreeSteps() {
  return (
    <section className="py-24 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            Three steps to live.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="text-6xl font-mono font-black text-[var(--border-strong)] mb-6 group-hover:text-[var(--brand)] transition-colors">
                {step.num}
              </div>
              <div className="w-full max-w-[280px] aspect-square rounded-[32px] border border-[var(--border)] overflow-hidden bg-[var(--surface)] mb-8 shadow-xl p-2 relative group-hover:border-[var(--brand)] transition-colors">
                <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-[var(--surface-inset)]">
                  {step.mockup}
                </div>
              </div>
              <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">{step.title}</h3>
              <p className="text-[var(--text-muted)] font-medium max-w-[280px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
