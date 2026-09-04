"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Workflow, Cpu, Globe, BarChart3, MessageSquare, Zap, Sparkles, TrendingUp, Users, CheckCircle2 } from "lucide-react"

const AbstractFlow = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
    
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Trigger Node */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="w-full max-w-[220px] bg-[var(--surface)] rounded-xl border border-[var(--brand)] p-3 shadow-lg flex items-center gap-3 relative z-10"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center shadow-md shadow-[var(--brand)]/30">
          <Globe className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-[var(--text-primary)]">Incoming Message</div>
          <div className="text-[10px] text-[var(--text-secondary)]">WhatsApp</div>
        </div>
      </motion.div>

      {/* Connection Line */}
      <div className="w-0.5 h-8 bg-gradient-to-b from-[var(--brand)] to-[var(--border-strong)] -my-3 relative z-0" />

      {/* Condition Node */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-[200px] bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 shadow-md flex flex-col gap-2 relative z-10"
      >
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center">Intent = Support?</div>
      </motion.div>

      <div className="flex gap-16 -my-3 relative z-0">
        <div className="w-0.5 h-10 bg-[var(--border-strong)] rotate-[-30deg] origin-top" />
        <div className="w-0.5 h-10 bg-[var(--lilac)] rotate-[30deg] origin-top" />
      </div>

      {/* Action Nodes */}
      <div className="flex gap-4 relative z-10">
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-[120px] bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 shadow-md flex items-center gap-2 opacity-60"
        >
          <div className="w-6 h-6 rounded-md bg-[var(--surface-2)] flex items-center justify-center"><Users className="w-3 h-3 text-[var(--text-muted)]"/></div>
          <div className="text-[9px] font-bold text-[var(--text-secondary)]">Agent</div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-[140px] bg-[var(--surface)] rounded-xl border-2 border-[var(--lilac)] p-3 shadow-xl flex items-center gap-2 relative"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--lilac)] rounded-full shadow-[0_0_8px_var(--lilac)]" 
          />
          <div className="w-6 h-6 rounded-md bg-[var(--lilac-soft)] text-[var(--lilac)] flex items-center justify-center"><Cpu className="w-3 h-3"/></div>
          <div className="text-[9px] font-bold text-[var(--text-primary)]">AI Auto-Reply</div>
        </motion.div>
      </div>
    </div>
  </div>
);

const AbstractCopilot = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-end justify-center p-6 relative overflow-hidden">
    <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--lilac)] opacity-10 blur-[50px] rounded-full" />
    
    <div className="w-full max-w-[320px] bg-[var(--bg)] rounded-t-2xl border-x-2 border-t-2 border-[var(--border)] shadow-2xl flex flex-col h-[280px] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]">
        <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-bold">U</div>
        <div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Customer Issue</div>
          <div className="text-[9px] text-[var(--text-muted)]">Ticket #4092</div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} className="flex gap-2 max-w-[85%]">
          <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] shrink-0" />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl rounded-tl-sm p-3 text-[10px] text-[var(--text-secondary)] shadow-sm">
            I can't log into my account, it keeps saying password incorrect even after I reset it.
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex gap-2 max-w-[90%] self-end flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-[var(--lilac)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--lilac)]/20">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="bg-gradient-to-br from-[var(--lilac-soft)] to-[var(--surface)] border border-[var(--lilac)]/30 rounded-2xl rounded-tr-sm p-3 text-[10px] text-[var(--text-primary)] shadow-sm">
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.8 }}
            >
              I see the issue. There is a cached session preventing the login. I have cleared it on our end. Please try logging in again now!
            </motion.span>
          </div>
        </motion.div>
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="h-8 w-full rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center px-3 gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--lilac)] animate-pulse" />
          <div className="text-[10px] text-[var(--text-muted)]">AI is typing...</div>
        </div>
      </div>
    </div>
  </div>
);

const AbstractOmnichannel = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center relative overflow-hidden">
    <motion.div 
      initial={{ y: 20, opacity: 0, rotateX: 10 }}
      whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="w-[90%] h-[80%] bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-2xl flex overflow-hidden perspective-[1000px]"
    >
      {/* Sidebar Channels */}
      <div className="w-12 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col items-center py-4 gap-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)]"><Globe className="w-4 h-4 text-[var(--text-muted)]"/></div>
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500"><MessageSquare className="w-4 h-4"/></div>
        <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)]"><MessageSquare className="w-4 h-4 text-[var(--text-muted)]"/></div>
      </div>
      
      {/* Inbox List */}
      <div className="w-32 border-r border-[var(--border)] bg-[var(--surface)] py-3 hidden sm:flex flex-col gap-1">
        <div className="px-3 text-[9px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Inbox</div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`mx-2 p-2 rounded-lg ${i === 1 ? 'bg-[var(--surface-2)] border border-[var(--border)]' : ''} flex gap-2 items-center`}>
            <div className="w-5 h-5 rounded-full bg-[var(--border)] shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 w-12 bg-[var(--border-strong)] rounded-full mb-1" />
              <div className="h-1 w-16 bg-[var(--border)] rounded-full" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg)]">
        <div className="h-10 border-b border-[var(--border)] flex items-center px-4">
          <div className="text-xs font-bold text-[var(--text-primary)]">Sarah Jenkins</div>
          <div className="ml-auto flex gap-2">
            <div className="w-4 h-4 rounded-md bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center"><CheckCircle2 className="w-3 h-3"/></div>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
           <div className="h-8 w-3/4 bg-[var(--surface-2)] rounded-r-xl rounded-bl-xl border border-[var(--border)]" />
           <div className="h-12 w-2/3 self-end bg-[var(--brand)] text-[var(--bg)] rounded-l-xl rounded-br-xl opacity-90" />
           <div className="h-6 w-1/2 bg-[var(--surface-2)] rounded-r-xl rounded-bl-xl border border-[var(--border)]" />
        </div>
      </div>
    </motion.div>
  </div>
);

const AbstractAnalytics = () => {
  const bars = [40, 65, 45, 80, 55, 95, 75];
  return (
    <div className="w-full h-full bg-[var(--surface-inset)] flex flex-col justify-center p-6 md:p-8 relative overflow-hidden">
      <div className="w-full max-w-[340px] mx-auto bg-[var(--bg)] rounded-2xl border border-[var(--border)] shadow-xl p-5">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Resolution Rate</div>
            <div className="text-3xl font-display font-black text-[var(--text-primary)] flex items-center gap-2">
              84.2% <span className="text-xs font-bold text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[var(--butter-soft)] text-[var(--butter)] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="h-32 flex items-end justify-between gap-2 border-b border-[var(--border)] pb-2">
          {bars.map((h, i) => (
            <div key={i} className="w-full flex justify-center group relative">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
                className={`w-6 rounded-t-md ${i === 5 ? 'bg-[var(--butter)] shadow-[0_0_15px_var(--butter)] z-10' : 'bg-[var(--surface-2)] group-hover:bg-[var(--border-strong)] transition-colors'}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1 text-[9px] font-bold text-[var(--text-muted)]">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="text-[var(--text-primary)]">Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    id: "visual-studio",
    eyebrow: "01. VISUAL STUDIO",
    heading: "Build flows without breaking a sweat",
    copy: "Drag and drop triggers, conditions, and actions onto an infinite canvas. Complex logic feels like playing with blocks.",
    mockup: <AbstractFlow />,
    accent: "bg-[var(--brand)]",
    accentColor: "var(--brand)",
    reversed: false,
    icon: <Workflow className="w-5 h-5" />
  },
  {
    id: "ai-copilot",
    eyebrow: "02. NATIVE AI COPILOT",
    heading: "Let AI handle the busywork",
    copy: "Embed LLM nodes directly in your flows. Categorize intents, summarize long threads, or generate draft replies on autopilot.",
    mockup: <AbstractCopilot />,
    accent: "bg-[var(--lilac)]",
    accentColor: "var(--lilac)",
    reversed: true,
    icon: <Cpu className="w-5 h-5" />
  },
  {
    id: "omnichannel",
    eyebrow: "03. OMNICHANNEL",
    heading: "One inbox for every channel",
    copy: "WhatsApp, Instagram, SMS, and Email flowing into a single unified view. Respond faster without switching tabs.",
    mockup: <AbstractOmnichannel />,
    accent: "bg-[var(--success)]",
    accentColor: "var(--success)",
    reversed: false,
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: "analytics",
    eyebrow: "04. DEEP ANALYTICS",
    heading: "Insight over noise",
    copy: "Stop drowning in spreadsheets. See clear trends, conversion metrics, and AI-generated plain text explanations of what changed.",
    mockup: <AbstractAnalytics />,
    accent: "bg-[var(--butter)]",
    accentColor: "var(--butter)",
    reversed: true,
    icon: <BarChart3 className="w-5 h-5" />
  }
]

export function MarketingFeatures() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--bg)] overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">
        {features.map((feature, idx) => (
          <div 
            key={feature.id} 
            className={`flex flex-col ${feature.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-[var(--text-muted)]">
                <span className={`p-2 rounded-lg text-[var(--text-on-brand)] ${feature.accent}`}>
                  {feature.icon}
                </span>
                {feature.eyebrow}
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">
                {feature.heading}
              </h2>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium leading-relaxed max-w-lg">
                {feature.copy}
              </p>
            </div>

            {/* Abstract Graphic Panel */}
            <div className="flex-1 relative w-full aspect-square max-w-xl">
              <div className={`absolute inset-0 ${feature.accent} opacity-10 rounded-[40px] rotate-3 scale-105 blur-lg -z-10`} />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full h-full relative rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl overflow-hidden"
              >
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-[var(--surface-inset)] relative">
                  {feature.mockup}
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
