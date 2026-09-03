"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bot,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
  Globe,
  Code2,
  Workflow,
  Cpu,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px]">
               <div className="w-full h-full bg-[#050505] rounded-lg flex items-center justify-center">
                  <Zap className="text-white h-4 w-4" />
               </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FlowStage</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#builder" className="hover:text-white transition-colors">Visual Builder</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Button
              asChild
              className="bg-white text-black font-semibold shadow-lg shadow-white/10 rounded-full"
              size="sm"
            >
              <Link href="/register">Start Building Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none -z-10">
           <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
           {/* Grid Pattern */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={fadeIn} initial="initial" animate="animate" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 mb-8 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Introducing FlowStage AI Copilot 2.0</span>
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-6"
          >
            Build conversational AI that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
              actually converts.
            </span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10"
          >
            The next-generation platform to build, manage, and scale AI-powered customer interactions across WhatsApp, Instagram, Messenger, and Telegram.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              className="bg-white text-black font-semibold h-12 px-8 rounded-full"
            >
              <Link href="/register">
                Start Building for Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              className="bg-white/5 border border-white/10 text-white font-medium h-12 px-8 backdrop-blur-md rounded-full"
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* High-Fidelity UI Mockup */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.4 }}
             className="mt-20 relative mx-auto max-w-5xl"
          >
             <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-50 blur-lg" />
             <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[400px] md:h-[600px]">
                {/* Sidebar */}
                <div className="hidden md:flex w-64 border-r border-white/5 bg-black/50 flex-col p-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-white/5 flex items-center px-3 gap-3">
                        <div className="h-5 w-5 rounded-full bg-white/10" />
                        <div className="h-2 w-24 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main Canvas Area */}
                <div className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Mock Node 1 */}
                  <div className="absolute top-1/4 left-1/4 w-64 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400"><Zap className="h-4 w-4"/></div>
                      <span className="text-sm font-semibold">User Message</span>
                    </div>
                    <div className="text-xs text-slate-400">"I need help with my order"</div>
                  </div>

                  {/* SVG Line */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none">
                     <path d="M 330 200 C 400 200, 400 350, 470 350" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                  </svg>

                  {/* Mock Node 2 */}
                  <div className="absolute top-1/2 left-1/2 w-64 rounded-xl border border-purple-500/30 bg-[#0a0a0a] p-4 shadow-xl shadow-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400"><Bot className="h-4 w-4"/></div>
                      <span className="text-sm font-semibold text-purple-100">AI Processing</span>
                    </div>
                    <div className="h-2 w-3/4 rounded-full bg-purple-500/20 mb-2" />
                    <div className="h-2 w-1/2 rounded-full bg-purple-500/20" />
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── Integrations Marquee ────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Connects instantly with</p>
          <div className="flex items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 text-xl font-bold"><MessageSquare /> WhatsApp</div>
             <div className="flex items-center gap-2 text-xl font-bold"><Globe /> Instagram</div>
             <div className="flex items-center gap-2 text-xl font-bold"><MessageSquare /> Messenger</div>
             <div className="flex items-center gap-2 text-xl font-bold"><Zap /> Telegram</div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────────────── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to automate at scale</h2>
            <p className="text-lg text-slate-400">FlowStage combines a visual flow builder, AI intelligence, and a unified CRM inbox into a single, seamless platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bento 1: Flow Builder (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Workflow className="h-8 w-8 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Visual Flow Studio</h3>
              <p className="text-slate-400 max-w-md relative z-10">Drag and drop nodes to build complex conversation trees. No coding required. Connect triggers, conditions, and API actions visually.</p>
              
              <div className="mt-8 rounded-xl border border-white/5 bg-black/50 p-4 h-48 overflow-hidden">
                 {/* Mini mockup code/canvas */}
                 <div className="flex gap-2 mb-2">
                   <div className="h-2 w-2 rounded-full bg-white/20"/>
                   <div className="h-2 w-2 rounded-full bg-white/20"/>
                 </div>
                 <div className="space-y-3 mt-4">
                   <div className="h-8 w-48 rounded bg-blue-500/20 border border-blue-500/30" />
                   <div className="h-8 w-64 rounded bg-white/5 border border-white/10 ml-8" />
                 </div>
              </div>
            </div>

            {/* Bento 2: AI */}
            <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cpu className="h-8 w-8 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Native AI Copilot</h3>
              <p className="text-slate-400">Embed LLMs directly into your flows to handle fallback intent, summarize conversations, or generate responses.</p>
            </div>

            {/* Bento 3: Unified Inbox */}
            <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="h-8 w-8 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Unified CRM Inbox</h3>
              <p className="text-slate-400">Manage human handoffs seamlessly. All messages from all channels stream into one powerful live inbox for your agents.</p>
            </div>

            {/* Bento 4: Analytics (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BarChart3 className="h-8 w-8 text-amber-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Actionable Insights</h3>
              <p className="text-slate-400 max-w-md">Track engagement rates, drop-offs, and human-handoff metrics in real-time. Optimize your flows based on actual user behavior data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Zap className="text-white h-5 w-5" />
               <span className="text-lg font-bold">FlowStage</span>
            </div>
            <p className="text-sm text-slate-500">
              The premium AI automation platform for modern businesses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link>
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/legal/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms-of-service" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center text-sm text-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
           <span>© {new Date().getFullYear()} FlowStage. All rights reserved.</span>
           <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Enterprise-grade Security</span>
        </div>
      </footer>
    </div>
  );
}
