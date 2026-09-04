"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
  Play,
  Moon,
  Sun,
  Check
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 p-[1px]">
               <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                  <Zap className="text-foreground h-4 w-4" />
               </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">FlowStage</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
            <a href="#builder" className="hover:text-foreground transition-colors">Visual Builder</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Button
              asChild
              className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 rounded-full"
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
           <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten" />
           <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten" />
           {/* Grid Pattern */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={fadeIn} initial="initial" animate="animate" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-8 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Introducing FlowStage AI Copilot 2.0</span>
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="max-w-4xl mx-auto text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1] mb-6"
          >
            Build conversational AI that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-emerald-500">
              actually converts.
            </span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10"
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
              className="bg-primary text-primary-foreground font-semibold h-12 px-8 rounded-full shadow-lg shadow-primary/20"
            >
              <Link href="/register">
                Start Building for Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              className="bg-background/50 border border-border text-foreground font-medium h-12 px-8 backdrop-blur-md rounded-full hover:bg-accent"
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
             <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-50 blur-lg" />
             <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row h-[400px] md:h-[600px]">
                {/* Sidebar */}
                <div className="hidden md:flex w-64 border-r border-border bg-muted/20 flex-col p-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-accent/50 flex items-center px-3 gap-3">
                        <div className="h-5 w-5 rounded-full bg-accent" />
                        <div className="h-2 w-24 rounded-full bg-accent" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main Canvas Area */}
                <div className="flex-1 bg-background relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Mock Node 1 */}
                  <div className="absolute top-1/4 left-1/4 w-64 rounded-xl border border-border bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500"><Zap className="h-4 w-4"/></div>
                      <span className="text-sm font-semibold">User Message</span>
                    </div>
                    <div className="text-xs text-muted-foreground">"I need help with my order"</div>
                  </div>

                  {/* SVG Line */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none">
                     <path d="M 330 200 C 400 200, 400 350, 470 350" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4" className="text-border" />
                  </svg>

                  {/* Mock Node 2 */}
                  <div className="absolute top-1/2 left-1/2 w-64 rounded-xl border border-primary/30 bg-card p-4 shadow-xl shadow-primary/10 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary"><Bot className="h-4 w-4"/></div>
                      <span className="text-sm font-semibold text-foreground">AI Processing</span>
                    </div>
                    <div className="h-2 w-3/4 rounded-full bg-primary/20 mb-2" />
                    <div className="h-2 w-1/2 rounded-full bg-primary/20" />
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── Integrations Marquee ────────────────────────────────────── */}
      <section id="integrations" className="py-10 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">Connects instantly with</p>
          <div className="flex items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 text-xl font-bold text-foreground"><MessageSquare /> WhatsApp</div>
             <div className="flex items-center gap-2 text-xl font-bold text-foreground"><Globe /> Instagram</div>
             <div className="flex items-center gap-2 text-xl font-bold text-foreground"><MessageSquare /> Messenger</div>
             <div className="flex items-center gap-2 text-xl font-bold text-foreground"><Zap /> Telegram</div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────────────── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to automate at scale</h2>
            <p className="text-lg text-muted-foreground">FlowStage combines a visual flow builder, AI intelligence, and a unified CRM inbox into a single, seamless platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bento 1: Flow Builder (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-border bg-card p-8 overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Workflow className="h-8 w-8 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Visual Flow Studio</h3>
              <p className="text-muted-foreground max-w-md relative z-10">Drag and drop nodes to build complex conversation trees. No coding required. Connect triggers, conditions, and API actions visually.</p>
              
              <div className="mt-8 rounded-xl border border-border bg-muted/50 p-4 h-48 overflow-hidden relative z-10">
                 {/* Mini mockup code/canvas */}
                 <div className="flex gap-2 mb-2">
                   <div className="h-2 w-2 rounded-full bg-foreground/20"/>
                   <div className="h-2 w-2 rounded-full bg-foreground/20"/>
                 </div>
                 <div className="space-y-3 mt-4">
                   <div className="h-8 w-48 rounded bg-blue-500/10 border border-blue-500/20" />
                   <div className="h-8 w-64 rounded bg-background border border-border ml-8" />
                 </div>
              </div>
            </div>

            {/* Bento 2: AI */}
            <div className="rounded-3xl border border-border bg-card p-8 overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cpu className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-3">Native AI Copilot</h3>
              <p className="text-muted-foreground relative z-10">Embed LLMs directly into your flows to handle fallback intent, summarize conversations, or generate responses.</p>
            </div>

            {/* Bento 3: Unified Inbox */}
            <div className="rounded-3xl border border-border bg-card p-8 overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="h-8 w-8 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Unified CRM Inbox</h3>
              <p className="text-muted-foreground relative z-10">Manage human handoffs seamlessly. All messages from all channels stream into one powerful live inbox for your agents.</p>
            </div>

            {/* Bento 4: Analytics (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-border bg-card p-8 overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BarChart3 className="h-8 w-8 text-amber-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Actionable Insights</h3>
              <p className="text-muted-foreground max-w-md relative z-10">Track engagement rates, drop-offs, and human-handoff metrics in real-time. Optimize your flows based on actual user behavior data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ───────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-extrabold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-8">Perfect for exploring FlowStage capabilities.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>1 Team Member</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>100 Conversations/mo</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>Basic Flow Builder</span>
                </li>
              </ul>
              
              <Button asChild variant="outline" className="w-full py-6 rounded-xl font-semibold">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-[2rem] border-2 border-primary bg-primary/5 p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-primary/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">Professional</h3>
              <div className="text-4xl font-extrabold mb-6">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground mb-8">For growing teams and serious automation.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Up to 5 Team Members</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Unlimited Channels</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Advanced AI Copilot</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Priority Support</span>
                </li>
              </ul>
              
              <Button asChild className="w-full py-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/register">Start 14-Day Trial</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-extrabold mb-6">Custom</div>
              <p className="text-sm text-muted-foreground mb-8">Dedicated infrastructure and custom integrations.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-blue-500" />
                  <span>Unlimited Team Members</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-blue-500" />
                  <span>Dedicated Success Manager</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-blue-500" />
                  <span>White-label Options</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-blue-500" />
                  <span>SSO & Custom SLA</span>
                </li>
              </ul>
              
              <Button asChild variant="outline" className="w-full py-6 rounded-xl font-semibold">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/40 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Zap className="text-foreground h-5 w-5" />
               <span className="text-lg font-bold">FlowStage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premium AI automation platform for modern businesses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/legal/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
           <span>© {new Date().getFullYear()} FlowStage. All rights reserved.</span>
           <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Enterprise-grade Security</span>
        </div>
      </footer>
    </div>
  );
}
