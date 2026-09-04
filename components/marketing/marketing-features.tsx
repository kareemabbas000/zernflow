"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Workflow, Cpu, Globe, BarChart3, MessageSquare, Zap, ArrowRight, Settings, Users, Sparkles, CheckCircle2, TrendingUp, Filter } from "lucide-react"

const MockupStudio = () => (
  <div className="w-full h-full bg-[var(--surface-2)] flex items-center justify-center p-6 relative overflow-hidden pt-12">
    {/* Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    
    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Node 1: Trigger */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-[var(--paper)] rounded-xl border border-[var(--border)] p-4 shadow-sm relative"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">Trigger: New Message</h4>
            <p className="text-xs text-[var(--ink-3)]">When customer sends a DM</p>
          </div>
        </div>
      </motion.div>

      {/* Arrow Down */}
      <div className="w-0.5 h-6 bg-[var(--border-strong)] -my-2 relative z-0" />

      {/* Node 2: AI Action */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-[var(--paper)] rounded-xl border border-[var(--brand)] p-4 shadow-md relative"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--lilac-soft)] text-[var(--lilac)] flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">AI Copilot</h4>
            <p className="text-xs text-[var(--ink-3)]">Analyze intent & generate reply</p>
          </div>
        </div>
        <div className="bg-[var(--surface-2)] rounded-md p-2 text-[10px] font-mono text-[var(--ink-2)]">
          &gt; prompt: &quot;Be helpful, concise...&quot;
        </div>
      </motion.div>

      {/* Arrow Down */}
      <div className="w-0.5 h-6 bg-[var(--border-strong)] -my-2 relative z-0" />

      {/* Node 3: Send */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-[var(--paper)] rounded-xl border border-[var(--border)] p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">Send Reply</h4>
            <p className="text-xs text-[var(--ink-3)]">Via original channel</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const MockupCopilot = () => (
  <div className="w-full h-full bg-[var(--paper)] flex flex-col p-6 pt-12 relative">
    <div className="flex items-center justify-between mb-6 border-b border-[var(--border)] pb-4">
      <div className="flex items-center gap-2">
        <Cpu className="w-5 h-5 text-[var(--lilac)]" />
        <h3 className="font-bold text-[var(--ink)]">AI Node Settings</h3>
      </div>
      <div className="text-xs font-medium bg-[var(--lilac-soft)] text-[var(--lilac)] px-2 py-1 rounded">GPT-4 Turbo</div>
    </div>

    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-[var(--ink-2)] uppercase tracking-wider">System Prompt</label>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--ink)] font-medium leading-relaxed">
          You are a helpful customer support agent for Zenith.
          <span className="text-[var(--lilac)]"> @knowledge_base</span> is attached. If you don&apos;t know the answer, output &quot;ESCALATE&quot;.
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-[var(--ink-2)] uppercase tracking-wider">Test Output</label>
        <div className="bg-[var(--surface-2)] rounded-xl p-3 flex gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--lilac)] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm text-[var(--ink-2)]">
            &quot;Hi Alex! Your order #4492 is currently out for delivery and should arrive by 8 PM today.&quot;
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MockupInbox = () => (
  <div className="w-full h-full bg-[var(--surface)] flex pt-6 relative">
    {/* Left Sidebar (Contacts) */}
    <div className="w-24 md:w-1/3 border-r border-[var(--border)] h-full bg-[var(--paper)] pt-6 flex flex-col">
      <div className="px-4 pb-4 border-b border-[var(--border)] hidden md:block">
        <h3 className="font-bold text-[var(--ink)] text-sm">Inbox</h3>
      </div>
      <div className="flex-1 overflow-hidden p-2 space-y-1">
        {[
          { name: "Sarah Jenkins", msg: "Can I upgrade?", channel: "whatsapp", active: true },
          { name: "David R.", msg: "Thanks for the help", channel: "instagram", active: false },
          { name: "Alex M.", msg: "Where is my order?", channel: "email", active: false },
        ].map((c, i) => (
          <div key={i} className={`p-2 md:p-3 rounded-lg flex items-center gap-3 ${c.active ? 'bg-[var(--surface-2)] border border-[var(--border)]' : 'hover:bg-[var(--surface)] border border-transparent'}`}>
            <div className="w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-xs shrink-0 relative">
              {c.name.charAt(0)}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
                <Globe className={`w-2.5 h-2.5 ${c.channel === 'whatsapp' ? 'text-[var(--success)]' : c.channel === 'instagram' ? 'text-[var(--coral)]' : 'text-[var(--brand)]'}`} />
              </div>
            </div>
            <div className="hidden md:block overflow-hidden">
              <h4 className="text-sm font-bold text-[var(--ink)] truncate">{c.name}</h4>
              <p className="text-xs text-[var(--ink-3)] truncate">{c.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Right Area (Chat) */}
    <div className="flex-1 h-full bg-[var(--paper)] pt-6 flex flex-col">
      <div className="px-6 pb-4 border-b border-[var(--border)] flex items-center gap-3">
        <h3 className="font-bold text-[var(--ink)] text-sm">Sarah Jenkins</h3>
        <span className="text-[10px] bg-[var(--success-soft)] text-[var(--success)] px-2 py-0.5 rounded font-bold">Online</span>
      </div>
      <div className="flex-1 p-6 flex flex-col justify-end gap-4">
        <div className="flex items-end gap-2 max-w-[80%]">
          <div className="w-6 h-6 rounded-full bg-[var(--brand)] shrink-0" />
          <div className="bg-[var(--surface)] p-3 rounded-2xl rounded-bl-sm text-sm text-[var(--ink)] border border-[var(--border)]">
            Hi! How can I help you today?
          </div>
        </div>
        <div className="flex items-end gap-2 max-w-[80%] self-end flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] shrink-0" />
          <div className="bg-[var(--brand)] p-3 rounded-2xl rounded-br-sm text-sm text-white">
            Can I upgrade to the pro plan?
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockupAnalytics = () => (
  <div className="w-full h-full bg-[var(--paper)] p-6 pt-12 flex flex-col gap-6 relative">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl">
        <p className="text-xs text-[var(--ink-3)] font-bold uppercase mb-1">Messages Sent</p>
        <h3 className="text-2xl font-black text-[var(--ink)]">14,203</h3>
        <span className="text-xs font-bold text-[var(--success)] flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" /> +12%
        </span>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl">
        <p className="text-xs text-[var(--ink-3)] font-bold uppercase mb-1">AI Deflection</p>
        <h3 className="text-2xl font-black text-[var(--ink)]">68%</h3>
        <span className="text-xs font-bold text-[var(--success)] flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" /> +5%
        </span>
      </div>
    </div>

    <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col">
      <h4 className="text-sm font-bold text-[var(--ink)] mb-4">Volume by Channel</h4>
      <div className="flex-1 flex flex-col justify-center gap-4">
        {[
          { label: "WhatsApp", val: 80, color: "bg-[var(--success)]" },
          { label: "Instagram", val: 45, color: "bg-[var(--coral)]" },
          { label: "Email", val: 20, color: "bg-[var(--brand)]" },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-[var(--ink-2)]">{item.label}</span>
              <span className="text-[var(--ink)]">{item.val}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${item.val}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
                className={`h-full ${item.color} rounded-full`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const features = [
  {
    id: "visual-studio",
    eyebrow: "01. VISUAL STUDIO",
    heading: "Build flows without breaking a sweat",
    copy: "Drag and drop triggers, conditions, and actions onto an infinite canvas. Complex logic feels like playing with blocks.",
    mockup: <MockupStudio />,
    accent: "bg-[var(--brand)]",
    reversed: false,
    icon: <Workflow className="w-5 h-5" />
  },
  {
    id: "ai-copilot",
    eyebrow: "02. NATIVE AI COPILOT",
    heading: "Let AI handle the busywork",
    copy: "Embed LLM nodes directly in your flows. Categorize intents, summarize long threads, or generate draft replies on autopilot.",
    mockup: <MockupCopilot />,
    accent: "bg-[var(--lilac)]",
    reversed: true,
    icon: <Cpu className="w-5 h-5" />
  },
  {
    id: "omnichannel",
    eyebrow: "03. OMNICHANNEL",
    heading: "One inbox for every channel",
    copy: "WhatsApp, Instagram, SMS, and Email flowing into a single unified view. Respond faster without switching tabs.",
    mockup: <MockupInbox />,
    accent: "bg-[var(--lime)]",
    reversed: false,
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: "analytics",
    eyebrow: "04. DEEP ANALYTICS",
    heading: "Insight over noise",
    copy: "Stop drowning in spreadsheets. See clear trends, conversion metrics, and AI-generated plain text explanations of what changed.",
    mockup: <MockupAnalytics />,
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
                  <div className="absolute top-0 inset-x-0 h-6 bg-[var(--surface-2)] border-b border-[var(--border-strong)] flex items-center px-4 gap-1.5 z-20">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/80" />
                  </div>
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
