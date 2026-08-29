"use client";

import Link from "next/link";
import {
  MessageSquare,
  Bot,
  Zap,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Radio,
  BarChart3,
  Cpu,
  Lock,
  Headphones,
  Check,
  Send,
  UserCheck,
  CornerDownRight,
  Globe,
  Sliders,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PlatformIcon } from "@/components/platform-icon";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#channels" className="hover:text-foreground transition-colors">
              Omnichannel
            </a>
            <a href="#inbox" className="hover:text-foreground transition-colors">
              Unified Inbox
            </a>
            <a href="#ai" className="hover:text-foreground transition-colors">
              AI Copilot
            </a>
            <a href="#automations" className="hover:text-foreground transition-colors">
              Flow Builder
            </a>
            <a href="#crm" className="hover:text-foreground transition-colors">
              Contacts CRM
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Background Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#6C2BFF]/20 via-[#00C2FF]/15 to-[#FF3D81]/15 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="h-3.5 w-3.5 text-[#00C2FF]" />
            <span>AI-Powered Omnichannel Communication Platform</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl mx-auto text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
            Every Conversation. <br />
            <span className="bg-gradient-to-r from-[#6C2BFF] via-[#9333EA] to-[#00C2FF] bg-clip-text text-transparent">
              One Intelligent Workspace.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Manage customer conversations across <strong>Facebook, Instagram, WhatsApp, X, and Telegram</strong> from one powerful inbox.
            Automate repetitive conversations, deploy AI agents, and keep your team connected with every customer.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#channels"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-8 py-4 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Explore Platform
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>100% White-Label Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Real-Time Webhooks & Audio Chimes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Native Meta & Telegram APIs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Built-in Visual Flow Canvas</span>
            </div>
          </div>

          {/* ── Realistic Hero Product Visual ───────────────────────── */}
          <div className="mt-16 relative rounded-3xl border border-border/80 bg-card p-2 sm:p-4 shadow-2xl shadow-primary/10 overflow-hidden text-left">
            <div className="rounded-2xl border border-border/60 bg-background overflow-hidden flex flex-col md:flex-row h-[620px]">
              {/* Left Column: Multi-Channel Inbox List */}
              <div className="w-full md:w-80 border-r border-border flex flex-col bg-card/50">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrandLogo size="sm" showText={false} />
                    <span className="text-xs font-bold text-foreground">KA COMM Inbox</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>

                <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
                  {/* Conversation 1 (Active / WhatsApp) */}
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 flex items-start gap-3 cursor-pointer">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-xs text-emerald-700">
                        SJ
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center">
                        <PlatformIcon platform="whatsapp" className="h-2.5 w-2.5" size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">Sarah Jenkins</span>
                        <span className="text-[10px] text-muted-foreground">1m ago</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 truncate mt-0.5">
                        Can you confirm pricing for our 15 team seats?
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="rounded bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.2">
                          AI Handled
                        </span>
                        <span className="rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-1.5 py-0.2">
                          Qualified Lead
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversation 2 (Instagram) */}
                  <div className="rounded-xl border border-transparent hover:bg-muted/40 p-3 flex items-start gap-3 transition-colors">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center font-bold text-xs text-pink-700">
                        AL
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center">
                        <PlatformIcon platform="instagram" className="h-2.5 w-2.5" size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground truncate">Alex Rivera</span>
                        <span className="text-[10px] text-muted-foreground">6m ago</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        I replied to your latest reel about the new API release!
                      </p>
                    </div>
                  </div>

                  {/* Conversation 3 (Telegram) */}
                  <div className="rounded-xl border border-transparent hover:bg-muted/40 p-3 flex items-start gap-3 transition-colors">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-xs text-sky-700">
                        MK
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center">
                        <PlatformIcon platform="telegram" className="h-2.5 w-2.5" size={10} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground truncate">Max Kovalev</span>
                        <span className="text-[10px] text-muted-foreground">12m ago</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        /status - Webhook cluster latency test
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Active Conversation & AI Response */}
              <div className="flex-1 flex flex-col bg-background">
                {/* Thread Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-card/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      SJ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Sarah Jenkins</span>
                        <span className="rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5">
                          WhatsApp Business
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">+1 (555) 234-8901 • Enterprise Inquiry</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      AI Copilot Active
                    </span>
                    <button className="rounded-md bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold hover:bg-primary/20 transition-colors">
                      Human Takeover
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-muted/5 text-xs">
                  {/* Customer message */}
                  <div className="flex gap-3 max-w-[75%]">
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      SJ
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-card border border-border p-3.5 text-foreground shadow-sm">
                      <p>Hi team! We are looking to migrate 15 support agents to KA COMM this quarter. Can you confirm annual billing options and WhatsApp WABA setup?</p>
                      <span className="block mt-1 text-[9px] text-muted-foreground">10:42 AM</span>
                    </div>
                  </div>

                  {/* AI Copilot Answer */}
                  <div className="flex gap-3 max-w-[75%] ml-auto flex-row-reverse">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground p-3.5 shadow-md shadow-primary/20">
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-primary-foreground/90">
                        <Sparkles className="h-3 w-3 text-[#00C2FF]" />
                        KA COMM AI Assistant
                      </div>
                      <p className="leading-relaxed">
                        Hello Sarah! Absolutely. With 15 seats, you qualify for our Enterprise Volume Tier ($79/seat/mo billed annually), which includes unified WhatsApp multi-number WABA routing and 100% white-label customer selection screens.
                      </p>
                      <span className="block mt-1 text-[9px] text-primary-foreground/75">10:42 AM • Auto-Dispatched</span>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div className="p-3 border-t border-border bg-card/30 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Type a message or let KA COMM AI suggest a reply..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs text-muted-foreground focus:outline-none"
                  />
                  <button className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Contact CRM & AI Context */}
              <div className="hidden lg:flex w-72 border-l border-border flex-col p-4 bg-card/30 text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-bold text-foreground">Customer Profile</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Company</span>
                    <p className="font-semibold text-foreground mt-0.5">Nexus Global Media</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Flow</span>
                    <p className="font-semibold text-primary mt-0.5">Enterprise Sales Bot v2.4</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tags</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">High Value</span>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">WhatsApp</span>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">US Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Omnichannel Channels Section ─────────────────────────── */}
      <section id="channels" className="py-20 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Globe className="h-3.5 w-3.5 text-[#00C2FF]" />
              Omnichannel Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Every Channel. One Conversation.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Bring your customer conversations together without constantly switching between apps, tabs, and logins.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Facebook */}
            <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <PlatformIcon platform="facebook" className="h-6 w-6" size={24} />
              </div>
              <h3 className="font-bold text-base text-foreground">Facebook Pages</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Connect multiple brand pages, manage page DMs, post comments, and automated replies.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>DMs & Comments</span>
                <span className="text-emerald-500 font-bold">✓ Native</span>
              </div>
            </div>

            {/* Instagram */}
            <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center mb-4">
                <PlatformIcon platform="instagram" className="h-6 w-6" size={24} />
              </div>
              <h3 className="font-bold text-base text-foreground">Instagram Direct</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Automate comment-to-DM triggers, story mentions, Reel reactions, and direct customer messages.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Story & DM Triggers</span>
                <span className="text-emerald-500 font-bold">✓ Native</span>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <PlatformIcon platform="whatsapp" className="h-6 w-6" size={24} />
              </div>
              <h3 className="font-bold text-base text-foreground">WhatsApp WABA</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Support multiple WhatsApp Business phone numbers, rich interactive buttons, and template broadcasts.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Multi-Number WABA</span>
                <span className="text-emerald-500 font-bold">✓ Native</span>
              </div>
            </div>

            {/* X / Twitter */}
            <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <div className="h-10 w-10 rounded-xl bg-foreground/10 text-foreground flex items-center justify-center mb-4">
                <PlatformIcon platform="twitter" className="h-6 w-6" size={24} />
              </div>
              <h3 className="font-bold text-base text-foreground">X / Twitter</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Connect official X handles via OAuth 2.0. Handle Direct Messages, user inquiries, and broadcast drops.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>OAuth 2.0 DMs</span>
                <span className="text-emerald-500 font-bold">✓ Native</span>
              </div>
            </div>

            {/* Telegram */}
            <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4">
                <PlatformIcon platform="telegram" className="h-6 w-6" size={24} />
              </div>
              <h3 className="font-bold text-base text-foreground">Telegram Bots</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Connect via custom bot tokens or instant 15-minute sync codes. Full support for inline commands and groups.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Bot & Channel Sync</span>
                <span className="text-emerald-500 font-bold">✓ Native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Unified Inbox Deep Dive ──────────────────────────────── */}
      <section id="inbox" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
                <MessageSquare className="h-3.5 w-3.5" />
                Unified Inbox Engine
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Your Entire Customer Inbox. In One Place.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Never lose track of a hot lead or support request. KA COMM groups your conversations into a fast, reactive interface with real-time audio chimes and status controls.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Live WebSockets & Background Poller</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Messages stream instantly into your inbox as soon as customers send them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Audio Chimes & Floating In-App Alerts</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Crisp acoustic sound notifications keep agents informed without needing to refresh tabs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Seamless Human Takeover</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pause automated AI bots with one click whenever human intervention is required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Live Inbox Performance</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">Response Latency: &lt;180ms</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-border p-3.5 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform="whatsapp" className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-foreground">WhatsApp Business API</div>
                      <div className="text-[11px] text-muted-foreground">Connected • Multi-Number WABA</div>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold">100% Operational</span>
                </div>

                <div className="rounded-xl border border-border p-3.5 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform="instagram" className="h-5 w-5 text-pink-500" />
                    <div>
                      <div className="font-semibold text-foreground">Instagram Graph API</div>
                      <div className="text-[11px] text-muted-foreground">Connected • Comment-to-DM Active</div>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold">100% Operational</span>
                </div>

                <div className="rounded-xl border border-border p-3.5 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform="telegram" className="h-5 w-5 text-sky-500" />
                    <div>
                      <div className="font-semibold text-foreground">Telegram Bot Gateway</div>
                      <div className="text-[11px] text-muted-foreground">Connected • Polling Synchronized</div>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold">100% Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Agent & Copilot Section ───────────────────────────── */}
      <section id="ai" className="py-20 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Bot className="h-3.5 w-3.5 text-[#00C2FF]" />
              Autonomous AI Copilot
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Let AI Handle the Conversation.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Deploy intelligent AI agents capable of answering customer questions 24/7, qualifying sales leads, and scheduling appointments.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Contextual Knowledge AI</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Feed your custom knowledge base, product documentation, and FAQs. AI answers accurately without hallucinating.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#00C2FF]/10 text-[#00C2FF] flex items-center justify-center mb-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Lead Qualification & Routing</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Automatically ask qualifying questions (budget, timeline, team size) and route high-value leads to sales reps.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#FF3D81]/10 text-[#FF3D81] flex items-center justify-center mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">BYO AI Provider</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Choose OpenAI, Claude, or custom LLM endpoints. Configure tone of voice, response length, and safety bounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Automation & Visual Flow Builder ─────────────────────── */}
      <section id="automations" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground">Visual Flow Builder Engine</span>
                <span className="rounded bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                  React Flow Canvas
                </span>
              </div>

              {/* Visual Flow Representation */}
              <div className="space-y-3 text-xs font-mono">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3.5">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Trigger</div>
                  <div className="text-foreground font-semibold mt-1">User comments &quot;PRICE&quot; on Instagram Reel</div>
                </div>

                <div className="flex justify-center text-muted-foreground">
                  <CornerDownRight className="h-4 w-4 text-primary" />
                </div>

                <div className="rounded-xl border border-primary/40 bg-primary/5 p-3.5">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Action: Direct Message</div>
                  <div className="text-foreground font-semibold mt-1">Send pricing sheet + 20% discount code in DM</div>
                </div>

                <div className="flex justify-center text-muted-foreground">
                  <CornerDownRight className="h-4 w-4 text-primary" />
                </div>

                <div className="rounded-xl border border-sky-500/40 bg-sky-500/5 p-3.5">
                  <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Action: CRM Sync</div>
                  <div className="text-foreground font-semibold mt-1">Tag contact as &quot;Instagram Lead&quot; &amp; subscribe to drip</div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
                <Zap className="h-3.5 w-3.5 text-[#FF3D81]" />
                Visual Automation Canvas
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Build Conversations That Run Themselves.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Connect triggers, keyword listeners, delays, conditional logic, and AI response nodes visually without writing code.
              </p>

              <div className="mt-6 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Keyword Triggers (e.g. &quot;START&quot;, &quot;HELP&quot;, &quot;DEMO&quot;)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Comment-to-DM Autoresponders for Instagram &amp; Facebook</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Drip Sequences &amp; Time-Delayed Followups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Version History &amp; 1-Click Rollback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contacts CRM Section ─────────────────────────────────── */}
      <section id="crm" className="py-20 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Users className="h-3.5 w-3.5 text-[#00C2FF]" />
              Unified Contact CRM
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Know Who You&apos;re Talking To.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every contact profile automatically aggregates full conversation history, past purchases, custom tags, and lifetime engagement across all channels.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-base text-foreground">Cross-Platform Profiles</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Merge identity across WhatsApp phone numbers, Instagram handles, and Facebook profiles in one clean view.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-base text-foreground">Custom Tags &amp; Segments</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Filter contacts by engagement score, acquisition channel, or VIP status to launch targeted broadcast campaigns.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-base text-foreground">Interaction Timeline</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Review complete message histories, triggered flows, and notes left by other teammates in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Conversion CTA ─────────────────────────────────── */}
      <section className="py-24 border-t border-border relative overflow-hidden bg-gradient-to-b from-card to-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#00C2FF]" />
            Start in Under 60 Seconds
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Your Customers Are Already Talking. <br />
            <span className="bg-gradient-to-r from-[#6C2BFF] via-[#9333EA] to-[#00C2FF] bg-clip-text text-transparent">
              KA COMM Helps You Answer.
            </span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Join modern businesses managing customer conversations across Facebook, Instagram, WhatsApp, X, and Telegram from one intelligent workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-95 transition-all"
            >
              Start Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Permanent Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/60 py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <BrandLogo size="md" />
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                AI-powered omnichannel communication and customer engagement for modern businesses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-muted-foreground">
              <a href="#channels" className="hover:text-foreground transition-colors">
                Omnichannel
              </a>
              <a href="#inbox" className="hover:text-foreground transition-colors">
                Unified Inbox
              </a>
              <a href="#ai" className="hover:text-foreground transition-colors">
                AI Copilot
              </a>
              <a href="#automations" className="hover:text-foreground transition-colors">
                Flow Builder
              </a>
              <Link href="/legal/open-source" className="hover:text-foreground transition-colors text-primary font-bold">
                Open Source Notices
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">KA COMM</span>
              <span>—</span>
              <span>Every Conversation. One Intelligent Workspace.</span>
            </div>

            <div className="text-center sm:text-right">
              <p className="font-semibold text-foreground">
                © 2026 KA COMM • <span className="text-primary font-bold">Developed by Kareem Abbas</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
