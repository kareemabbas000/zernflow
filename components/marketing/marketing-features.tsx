"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Workflow, Cpu, Globe, BarChart3, MessageSquare, Zap, Sparkles, TrendingUp, Users, CheckCircle2, Plus } from "lucide-react"

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

const AbstractFlow = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
    
    <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
      {/* Node 1 */}
      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-32 bg-[var(--bg)]/90 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 relative">
        <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center"><WhatsAppIcon className="w-5 h-5"/></div>
        <div className="text-[10px] font-bold text-[var(--text-primary)]">Incoming</div>
      </motion.div>
      
      {/* Line connecting 1 -> 2 */}
      <div className="w-0.5 h-6 md:w-8 md:h-0.5 bg-[var(--border)] relative overflow-hidden rounded-full">
        <motion.div className="absolute inset-0 bg-[var(--brand)]" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, repeat: Infinity }} />
      </div>

      {/* Node 2 */}
      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2, ease: "easeInOut" }} className="w-36 bg-[var(--bg)]/90 backdrop-blur-md border-2 border-[var(--brand)] rounded-2xl p-4 shadow-lg shadow-[var(--brand)]/10 flex flex-col items-center gap-2 relative z-10">
         <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--brand)] rounded-full text-white flex items-center justify-center shadow-md"><Sparkles className="w-3 h-3"/></div>
         <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center"><Workflow className="w-5 h-5 text-[var(--text-primary)]"/></div>
         <div className="text-xs font-black text-[var(--text-primary)]">AI Router</div>
      </motion.div>

      {/* Line connecting 2 -> 3 */}
      <div className="w-0.5 h-6 md:w-8 md:h-0.5 bg-[var(--border)] relative overflow-hidden rounded-full">
        <motion.div className="absolute inset-0 bg-[var(--lilac)]" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }} />
      </div>
      
      {/* Node 3 */}
      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, delay: 0.4, ease: "easeInOut" }} className="w-32 bg-[var(--bg)]/90 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[var(--lilac-soft)] text-[var(--lilac)] flex items-center justify-center"><Cpu className="w-5 h-5"/></div>
        <div className="text-[10px] font-bold text-[var(--text-primary)]">Auto-Reply</div>
      </motion.div>
    </div>
  </div>
);

const AbstractCopilot = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-[var(--bg)] border border-[var(--border)] rounded-3xl shadow-xl flex flex-col overflow-hidden h-[400px]">
      
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-[var(--text-primary)] shrink-0">JD</div>
          <div className="min-w-0">
            <div className="text-sm font-black text-[var(--text-primary)] truncate">John Doe</div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 truncate"><WhatsAppIcon className="w-3 h-3 text-[#25D366] shrink-0"/> WhatsApp User</div>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 flex flex-col justify-end gap-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--lilac-soft)_0%,transparent_70%)] opacity-30" />
        
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 max-w-[85%] z-10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 shrink-0" />
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl rounded-tl-sm p-3 text-xs text-[var(--text-primary)] shadow-sm">
            I can't log into my account.
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex gap-2 max-w-[85%] self-end flex-row-reverse z-10">
          <div className="w-6 h-6 rounded-full bg-[var(--lilac)] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="bg-[var(--lilac-soft)] border border-[var(--lilac)]/20 rounded-2xl rounded-tr-sm p-3 text-xs text-[var(--text-primary)] relative">
            <motion.div 
               initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.2 }}
               className="absolute inset-0 bg-[var(--surface)] flex items-center px-3 rounded-2xl rounded-tr-sm"
            >
              <div className="flex gap-1">
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 rounded-full bg-[var(--lilac)]" />
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 rounded-full bg-[var(--lilac)]" />
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 rounded-full bg-[var(--lilac)]" />
              </div>
            </motion.div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
              I've cleared your cache. Please try logging in again!
            </motion.span>
          </div>
        </motion.div>
      </div>
      
      {/* Input Area */}
      <div className="p-3 bg-[var(--bg)] border-t border-[var(--border)] z-10">
        <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2 flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)] ml-2">AI replying...</span>
          <button className="px-3 py-1 text-[10px] font-bold rounded-lg bg-[var(--brand)] text-white">Takeover</button>
        </div>
      </div>
    </div>
  </div>
);

const AbstractOmnichannel = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-4 relative overflow-hidden">
    <div className="w-full max-w-2xl bg-[var(--bg)] rounded-3xl border border-[var(--border)] shadow-xl flex overflow-hidden h-[400px]">
      
      {/* Inbox List (Hidden on Mobile) */}
      <div className="w-56 border-r border-[var(--border)] bg-[var(--surface)] hidden sm:flex flex-col z-10">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="font-black text-base text-[var(--text-primary)]">Inbox</div>
        </div>
        <div className="flex-1 overflow-hidden p-2 space-y-1">
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex gap-3 items-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--brand)]" />
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--border)]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#25D366] border border-[var(--surface-2)] flex items-center justify-center"><WhatsAppIcon className="w-2 h-2 text-white"/></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-[var(--text-primary)] truncate">Elena R.</div>
              <div className="text-[10px] text-[var(--text-secondary)] truncate">Is this in stock?</div>
            </div>
          </div>
          
          {[
            { n: "Marcus T.", icon: <InstagramIcon className="w-2 h-2 text-white"/>, bg: "bg-[#E1306C]" },
            { n: "David C.", icon: <FacebookIcon className="w-2 h-2 text-white"/>, bg: "bg-[#1877F2]" }
          ].map((item, i) => (
             <div key={i} className="p-3 rounded-xl hover:bg-[var(--surface-2)] border border-transparent transition-colors flex gap-3 items-center">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--border)]" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${item.bg} border border-[var(--surface)] flex items-center justify-center`}>{item.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-[var(--text-primary)] truncate">{item.n}</div>
                <div className="h-1.5 w-3/4 bg-[var(--border-strong)] rounded-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg)] relative min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center px-4 z-10 shrink-0 gap-2">
          <div className="flex flex-col min-w-0">
            <div className="font-black text-sm text-[var(--text-primary)] truncate">Elena R.</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#25D366]">
              <WhatsAppIcon className="w-3 h-3 shrink-0" /> <span className="truncate">WhatsApp</span>
            </div>
          </div>
          <button className="h-7 px-3 text-[10px] font-bold rounded-lg border border-[var(--border)] bg-[var(--surface)] shrink-0">Mark Done</button>
        </div>
        
        {/* Chat Body */}
        <div className="flex-1 p-4 flex flex-col justify-end gap-4 overflow-hidden relative">
           <div className="self-end bg-[var(--brand)] text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-sm">
             Hi Elena, how can we help you today?
           </div>
           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[var(--surface-2)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm p-3 max-w-[85%] text-xs shadow-sm">
             I saw your new summer collection on Instagram! Is the blue floral dress available in size M?
           </motion.div>
        </div>
        
        {/* Input */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Type a reply...</span>
            <button className="text-white bg-[var(--brand)] px-3 py-1 rounded-md font-bold text-[10px]">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AbstractAnalytics = () => {
  return (
    <div className="w-full h-full bg-[var(--bg)] flex flex-col relative overflow-hidden p-4 md:p-6">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--butter)] opacity-10 blur-[60px] rounded-full" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="font-display font-black text-xl text-[var(--text-primary)]">Performance</h3>
        <div className="bg-[var(--surface-2)] rounded-lg border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-primary)]">7 Days</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 z-10">
        {[
          { label: "Resolved", value: "84%", trend: "+12%", color: "text-[var(--success)]", bg: "bg-[var(--success-soft)]", icon: <TrendingUp className="w-4 h-4"/> },
          { label: "AI Handled", value: "68%", trend: "+5%", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]", icon: <Cpu className="w-4 h-4"/> },
          { label: "Hours", value: "142", trend: "+24h", color: "text-[var(--butter)]", bg: "bg-[var(--butter-soft)]", icon: <Zap className="w-4 h-4"/> },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 md:p-4 shadow-sm flex flex-col ${i === 2 ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-sm`}>
                {kpi.icon}
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${kpi.bg} ${kpi.color}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] mb-0.5">{kpi.value}</div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sweeping Area Chart */}
      <div className="flex-1 relative bg-[var(--surface-2)] rounded-xl border border-[var(--border)] overflow-hidden flex items-end">
        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 1000 300">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--butter)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0 300 L 0 250 C 100 250, 200 150, 300 180 C 400 210, 500 50, 600 100 C 700 150, 800 80, 900 120 L 1000 40 L 1000 300 Z"
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.path
            d="M 0 250 C 100 250, 200 150, 300 180 C 400 210, 500 50, 600 100 C 700 150, 800 80, 900 120 L 1000 40"
            fill="none"
            stroke="var(--butter)"
            strokeWidth="6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
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
