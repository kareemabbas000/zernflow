"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
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
  Check,
  Smartphone,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* ── Navigation ────────────────────────────────────────────── */}
      <header className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-full border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors hidden sm:block">
              Log in
            </Link>
            <Button asChild className="font-bold rounded-lg shadow-sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-bold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>FlowStage 2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            Intelligent Automation for <span className="text-primary">Modern Teams.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Unify your customer communications. Build powerful visual workflows, deploy AI copilots, and manage multi-channel inboxes from a single, elite platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 rounded-xl font-bold text-lg shadow-sm">
              <Link href="/register">Start Building Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-xl font-bold text-lg border-2">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────────── */}
      <section className="border-y border-border/40 bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-foreground">10M+</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Messages Processed</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-foreground">99.9%</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Uptime SLA</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-foreground">500+</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enterprise Teams</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-foreground">24/7</span>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Automated Support</span>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Features ───────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Everything you need.</h2>
            <p className="text-lg text-muted-foreground font-medium">A complete toolkit for conversation automation, designed for scale and simplicity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[20rem]">
            {/* Bento 1: Visual Builder */}
            <div className="md:col-span-2 rounded-[2rem] border border-border bg-card p-8 flex flex-col justify-between overflow-hidden relative shadow-sm group">
              <div className="relative z-10 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Visual Flow Studio</h3>
                <p className="text-muted-foreground font-medium max-w-md">Drag and drop nodes to build complex conversation trees. No coding required. Connect triggers, conditions, and API actions visually.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-muted/50 rounded-tl-2xl border-t border-l border-border transition-transform group-hover:scale-105" />
            </div>

            {/* Bento 2: AI */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Cpu className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Native AI Copilot</h3>
              <p className="text-muted-foreground font-medium text-sm">Embed LLMs directly into your flows to handle fallback intent, summarize conversations, or generate responses.</p>
            </div>

            {/* Bento 3: Omnichannel */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Omnichannel</h3>
              <p className="text-muted-foreground font-medium text-sm">Deploy once, run anywhere. Seamlessly support WhatsApp, Instagram, Messenger, and SMS simultaneously.</p>
            </div>

            {/* Bento 4: Analytics */}
            <div className="md:col-span-2 rounded-[2rem] border border-border bg-card p-8 flex flex-col justify-between overflow-hidden relative shadow-sm group">
              <div className="relative z-10 space-y-4 max-w-md">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold">Deep Analytics</h3>
                <p className="text-muted-foreground font-medium">Track conversation metrics, conversion rates, and agent performance in real-time. Export data instantly or connect via API.</p>
              </div>
              <div className="absolute right-8 bottom-8 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 bg-muted rounded-t-md transition-all group-hover:bg-emerald-500/20" style={{ height: `${40 + i * 20}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────────────────────────── */}
      <section id="integrations" className="py-24 border-y border-border/40 bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-3xl font-black tracking-tight">Connects with your stack</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-xl font-bold text-muted-foreground"><MessageSquare className="h-8 w-8 text-foreground" /> WhatsApp</div>
            <div className="flex items-center gap-3 text-xl font-bold text-muted-foreground"><Globe className="h-8 w-8 text-foreground" /> Instagram</div>
            <div className="flex items-center gap-3 text-xl font-bold text-muted-foreground"><MessageSquare className="h-8 w-8 text-foreground" /> Messenger</div>
            <div className="flex items-center gap-3 text-xl font-bold text-muted-foreground"><Zap className="h-8 w-8 text-foreground" /> Telegram</div>
            <div className="flex items-center gap-3 text-xl font-bold text-muted-foreground"><Smartphone className="h-8 w-8 text-foreground" /> SMS</div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-lg text-muted-foreground font-medium">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-black mb-6">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> 1 Team Member</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> 100 Conversations</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Basic Builder</li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-xl font-bold">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-[2rem] border-2 border-primary bg-card p-8 flex flex-col shadow-md relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-primary">Professional</h3>
              <div className="text-4xl font-black mb-6">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> 5 Team Members</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Unlimited Channels</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Advanced AI</li>
              </ul>
              <Button asChild className="w-full rounded-xl font-bold">
                <Link href="/register">Start 14-Day Trial</Link>
              </Button>
            </div>

            {/* Enterprise */}
            <div className="rounded-[2rem] border border-border bg-card p-8 flex flex-col shadow-sm">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-black mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Unlimited Seats</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Dedicated Success Manager</li>
                <li className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 text-primary" /> Custom SLA</li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-xl font-bold">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-muted/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <span className="font-bold">FlowStage</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/legal/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <Link href="/legal/terms-of-service" className="hover:text-foreground">Terms</Link>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
