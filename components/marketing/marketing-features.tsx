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
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-0 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
    
    <div className="relative z-10 w-full h-full flex items-center justify-center scale-90 sm:scale-100">
      
      {/* Animated SVG Path Connection */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <motion.path 
          d="M 280 140 C 280 180, 280 180, 280 220" 
          stroke="url(#gradient1)" strokeWidth="3" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        />
        <motion.path 
          d="M 280 280 C 280 320, 160 320, 160 360" 
          stroke="url(#gradient2)" strokeWidth="3" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        />
        <motion.path 
          d="M 280 280 C 280 320, 400 320, 400 360" 
          stroke="url(#gradient2)" strokeWidth="3" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, repeatType: "loop", ease: "linear" }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--success)" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--lilac)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--lilac)" />
            <stop offset="100%" stopColor="var(--lilac)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Trigger Node */}
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-64 bg-[var(--bg)]/90 backdrop-blur-xl rounded-2xl border-2 border-[var(--success)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-[var(--success)]/10 p-4 flex items-center gap-4 relative"
        >
          <div className="absolute -inset-1 bg-[var(--success)] opacity-20 blur-lg rounded-2xl" />
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg relative z-10">
            <WhatsAppIcon className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-[var(--success)] uppercase tracking-wider mb-0.5">Trigger</div>
            <div className="text-sm font-black text-[var(--text-primary)] leading-tight">Incoming WhatsApp</div>
          </div>
        </motion.div>

        {/* Space for line */}
        <div className="h-[76px]" />

        {/* Router Node */}
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          className="w-56 bg-[var(--bg)]/90 backdrop-blur-xl rounded-2xl border-2 border-[var(--border-strong)] shadow-xl p-4 flex flex-col gap-3 relative"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-primary)]">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Router</div>
              <div className="text-sm font-black text-[var(--text-primary)]">AI Intent Split</div>
            </div>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-2 text-xs font-medium text-[var(--text-secondary)] flex justify-between items-center">
            <span>If Intent == "Support"</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
          </div>
        </motion.div>

        {/* Space for lines */}
        <div className="h-[60px]" />

        <div className="flex gap-12 w-full justify-center">
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
            className="w-48 bg-[var(--bg)]/90 backdrop-blur-xl rounded-2xl border-2 border-[var(--border)] p-4 shadow-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center"><Users className="w-4 h-4 text-[var(--text-muted)]"/></div>
            <div>
              <div className="text-sm font-black text-[var(--text-primary)]">Human Handoff</div>
            </div>
          </motion.div>
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
            className="w-56 bg-[var(--bg)]/90 backdrop-blur-xl rounded-2xl border-2 border-[var(--lilac)] p-4 shadow-xl shadow-[var(--lilac)]/10 flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lilac)]/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="w-10 h-10 rounded-xl bg-[var(--lilac-soft)] text-[var(--lilac)] flex items-center justify-center shadow-inner"><Cpu className="w-5 h-5"/></div>
            <div>
              <div className="text-[10px] font-bold text-[var(--lilac)] uppercase tracking-wider mb-0.5">Generate</div>
              <div className="text-sm font-black text-[var(--text-primary)]">AI Auto-Reply</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Sidebar Tool panel */}
      <div className="absolute right-6 top-6 bottom-6 w-16 bg-[var(--bg)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col items-center py-4 gap-4 hidden sm:flex">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"><Plus className="w-5 h-5" /></div>
        <div className="w-8 h-px bg-[var(--border)] my-2" />
        {['bg-[#25D366] text-white', 'bg-[#E1306C] text-white', 'bg-[var(--lilac)] text-white', 'bg-[var(--surface-2)] text-[var(--text-primary)]'].map((bg, i) => (
          <div key={i} className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform`}>
            {i === 0 ? <WhatsAppIcon className="w-5 h-5"/> : i === 1 ? <InstagramIcon className="w-5 h-5"/> : i === 2 ? <Sparkles className="w-5 h-5"/> : <Workflow className="w-5 h-5"/>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AbstractCopilot = () => (
  <div className="w-full h-full bg-[var(--bg)] flex overflow-hidden">
    {/* Left Sidebar (Tickets) */}
    <div className="w-[35%] h-full border-r border-[var(--border)] bg-[var(--surface)] hidden md:flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] mb-4">Active Queue</div>
        <div className="bg-[var(--surface-2)] border border-[var(--brand)] shadow-sm rounded-xl p-3 cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--brand)]" />
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-sm text-[var(--text-primary)]">#4092 - Login Issue</span>
            <span className="text-[10px] font-bold text-[var(--text-muted)]">2m</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] truncate">I can't log into my account...</div>
        </div>
      </div>
      <div className="p-4 space-y-3 opacity-60">
        {[1, 2].map(i => (
           <div key={i} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 pointer-events-none">
             <div className="flex justify-between items-start mb-1">
               <span className="font-bold text-sm text-[var(--text-primary)]">#409{i} - Billing</span>
               <span className="text-[10px] font-bold text-[var(--text-muted)]">1h</span>
             </div>
             <div className="text-xs text-[var(--text-secondary)] truncate">Can I get an invoice for...</div>
           </div>
        ))}
      </div>
    </div>

    {/* Right Main Chat */}
    <div className="flex-1 h-full flex flex-col relative bg-[var(--surface-inset)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--lilac)] opacity-5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-[var(--text-primary)] shadow-inner">JD</div>
          <div>
            <div className="text-sm font-black text-[var(--text-primary)]">John Doe</div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><WhatsAppIcon className="w-3 h-3 text-[#25D366]"/> WhatsApp User</div>
          </div>
        </div>
        
        {/* Dynamic AI Intent Tag */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1, type: "spring" }}
          className="hidden sm:flex items-center gap-1.5 bg-[var(--lilac-soft)] border border-[var(--lilac)]/30 text-[var(--lilac)] px-3 py-1.5 rounded-full shadow-sm"
        >
          <Sparkles className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-wider">Intent: Tech Support</span>
        </motion.div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-end gap-6 z-10">
        {/* User Message */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shrink-0 shadow-sm" />
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-tl-sm p-4 text-sm text-[var(--text-primary)] shadow-sm">
            I can't log into my account, it keeps saying password incorrect even after I reset it. Can someone help?
          </div>
        </motion.div>
        
        {/* AI Typing / Response */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex gap-3 max-w-[90%] self-end flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-[var(--lilac)] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[var(--lilac)]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="bg-gradient-to-br from-[var(--lilac)]/10 to-[var(--surface)] border border-[var(--lilac)]/20 rounded-2xl rounded-tr-sm p-4 text-sm text-[var(--text-primary)] shadow-md relative overflow-hidden">
             {/* Typewriter effect simulation */}
            <motion.div 
               initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.2 }}
               className="absolute inset-0 bg-[var(--surface)] flex items-center px-4"
            >
              <div className="flex gap-1">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-[var(--lilac)]" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--lilac)]" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--lilac)]" />
              </div>
            </motion.div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
              Hi John! I see the issue. There is a cached session preventing your new password from taking effect. I've cleared the cache on our end. Please try logging in again!
            </motion.span>
          </div>
        </motion.div>
      </div>
      
      {/* Reply Input */}
      <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] z-10">
        <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between opacity-50 pointer-events-none">
          <span className="text-sm text-[var(--text-muted)]">AI is handling this conversation...</span>
          <button className="h-7 px-3 text-xs font-bold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]">Takeover</button>
        </div>
      </div>
    </div>
  </div>
);

const AbstractOmnichannel = () => (
  <div className="w-full h-full bg-[var(--surface-inset)] flex items-center justify-center p-0 md:p-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--bg)_0%,transparent_100%)] opacity-80" />
    
    <motion.div 
      initial={{ y: 30, opacity: 0, rotateX: 5 }}
      whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 1 }}
      className="w-full h-full md:w-[95%] md:h-[90%] bg-[var(--bg)] md:rounded-[32px] border-y md:border border-[var(--border)] shadow-2xl flex overflow-hidden perspective-[1000px] z-10"
    >
      {/* Sidebar Channels */}
      <div className="w-16 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col items-center py-6 gap-6 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="w-12 h-12 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center shadow-lg"><Workflow className="w-6 h-6"/></div>
        <div className="w-8 h-px bg-[var(--border)] my-2" />
        
        {/* Channel Icons with Badges */}
        <div className="relative group cursor-pointer">
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--brand)] text-[var(--bg)] text-[9px] font-bold flex items-center justify-center shadow-sm z-10">3</div>
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] group-hover:bg-[#25D366]/10 text-[#25D366] flex items-center justify-center transition-colors"><WhatsAppIcon className="w-6 h-6"/></div>
        </div>
        
        <div className="relative group cursor-pointer">
           <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] group-hover:bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center transition-colors"><InstagramIcon className="w-6 h-6"/></div>
        </div>

        <div className="relative group cursor-pointer">
           <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] group-hover:bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center transition-colors"><FacebookIcon className="w-6 h-6"/></div>
        </div>
        
        <div className="relative group cursor-pointer">
           <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] group-hover:bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center transition-colors"><TelegramIcon className="w-6 h-6"/></div>
        </div>
      </div>
      
      {/* Inbox List */}
      <div className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-10 hidden lg:flex">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]/50 backdrop-blur-md">
          <div className="font-black text-lg text-[var(--text-primary)]">Unified Inbox</div>
          <div className="w-6 h-6 rounded-md bg-[var(--surface-2)] flex items-center justify-center"><Globe className="w-3 h-3 text-[var(--text-muted)]"/></div>
        </div>
        <div className="flex-1 overflow-hidden p-2 space-y-1">
          {/* Active Chat Item */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex gap-3 items-center cursor-pointer relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--brand)]" />
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=a" alt="User" className="w-10 h-10 rounded-full object-cover shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#25D366] border-2 border-[var(--surface-2)] flex items-center justify-center"><WhatsAppIcon className="w-2 h-2 text-white"/></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-[var(--text-primary)] truncate">Elena R.</span>
                <span className="text-[10px] font-bold text-[var(--brand)]">Just now</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">Is this in stock?</div>
            </div>
          </div>
          
          {/* Inactive Items */}
          {[
            { n: "Marcus T.", t: "5m", icon: <InstagramIcon className="w-2 h-2 text-white"/>, bg: "bg-[#E1306C]" },
            { n: "David C.", t: "1h", icon: <FacebookIcon className="w-2 h-2 text-white"/>, bg: "bg-[#1877F2]" }
          ].map((item, i) => (
             <div key={i} className="p-3 rounded-xl hover:bg-[var(--surface-2)] border border-transparent transition-colors flex gap-3 items-center cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold text-xs">{item.n.charAt(0)}</div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${item.bg} border-2 border-[var(--surface)] flex items-center justify-center`}>{item.icon}</div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[var(--text-primary)] truncate">{item.n}</span>
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">{item.t}</span>
                </div>
                <div className="h-1.5 w-3/4 bg-[var(--border-strong)] rounded-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--surface-inset)] relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="h-16 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md flex items-center px-6 z-10 shadow-sm">
          <div className="font-black text-lg text-[var(--text-primary)]">Elena R.</div>
          <div className="ml-4 flex items-center gap-2 text-xs font-bold text-[#25D366] bg-[#25D366]/10 px-3 py-1 rounded-full">
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
          </div>
          <div className="ml-auto flex gap-2">
            <button className="h-8 px-4 text-xs font-bold rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]">Mark Resolved</button>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-4 z-10 overflow-hidden">
           <div className="self-end bg-[var(--brand)] text-[var(--text-on-brand)] rounded-2xl rounded-tr-sm p-3 max-w-[80%] shadow-md">
             Hi Elena, how can we help you today?
           </div>
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
             I saw your new summer collection on Instagram! Is the blue floral dress available in size M?
           </motion.div>
        </div>
        
        <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)] z-10">
          <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center shrink-0 cursor-pointer"><Sparkles className="w-4 h-4" /></div>
            <div className="text-sm font-medium text-[var(--text-muted)] flex-1 px-2">Type a message or use AI...</div>
            <button className="h-8 px-4 text-xs rounded-lg font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">Send</button>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const AbstractAnalytics = () => {
  return (
    <div className="w-full h-full bg-[var(--bg)] flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--butter)] opacity-10 blur-[100px] rounded-full" />
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]/50 backdrop-blur-md z-10">
        <h3 className="font-display font-black text-2xl text-[var(--text-primary)]">Performance</h3>
        <div className="bg-[var(--surface-2)] rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-primary)]">Last 7 Days</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 p-8 z-10">
        {[
          { label: "Resolution Rate", value: "84.2%", trend: "+12%", color: "text-[var(--success)]", bg: "bg-[var(--success-soft)]", icon: <TrendingUp className="w-5 h-5"/> },
          { label: "AI Deflection", value: "68%", trend: "+5%", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]", icon: <Cpu className="w-5 h-5"/> },
          { label: "Hours Saved", value: "142h", trend: "+24h", color: "text-[var(--butter)]", bg: "bg-[var(--butter-soft)]", icon: <Zap className="w-5 h-5"/> },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm flex flex-col justify-between group hover:border-[var(--brand)] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-sm`}>
                {kpi.icon}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${kpi.bg} ${kpi.color}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <div className="text-4xl font-display font-black text-[var(--text-primary)] mb-1">{kpi.value}</div>
              <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sweeping Area Chart */}
      <div className="flex-1 relative mt-auto z-0 flex items-end">
        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 1000 300">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--butter)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0 300 L 0 250 C 100 250, 200 150, 300 180 C 400 210, 500 50, 600 100 C 700 150, 800 80, 900 120 L 1000 40 L 1000 300 Z"
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
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
        
        <div className="w-full border-t border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md px-8 py-3 flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest z-10 relative">
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
