"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bot,
  Zap,
  Users,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PlatformIcon } from "@/components/platform-icon";

export default function LandingPage() {
  const t = useTranslations("Landing");

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col selection:bg-purple-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            {/* FlowStage Logo (Premium Icon) */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px]">
               <div className="w-full h-full bg-[#030712] rounded-xl flex items-center justify-center">
                  <Zap className="text-blue-400 h-5 w-5" />
               </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">FlowStage</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#channels" className="hover:text-white transition-colors">{t("nav_omnichannel")}</a>
            <a href="#inbox" className="hover:text-white transition-colors">{t("nav_inbox")}</a>
            <a href="#ai" className="hover:text-white transition-colors">{t("nav_ai")}</a>
            <a href="#flow" className="hover:text-white transition-colors">{t("nav_flow")}</a>
            <Link href="/pricing" className="hover:text-white transition-colors text-purple-400">{t("nav_pricing")}</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              {t("sign_in")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg hover:bg-slate-200 transition-all"
            >
              {t("start_free")}
            </Link>
            
            {/* Language Switcher - Simple Dropdown for Demo */}
            <select 
               className="bg-[#0f172a] border border-white/10 rounded-md text-xs text-white p-1"
               onChange={(e) => window.location.href = `/${e.target.value}`}
               defaultValue={typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en'}
            >
               <option value="en">EN</option>
               <option value="ar">AR</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none -z-10 opacity-60">
           <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>{t("badge")}</span>
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white leading-[1.1]"
          >
            {t("headline_1")} <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t("headline_2")}
            </span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="mt-8 max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed"
          >
            {t("sub_headline")}
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-all"
            >
              {t("start_trial")}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
            <a
              href="#channels"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t("explore")}
            </a>
          </motion.div>

          {/* Premium UI Mockup Showcase */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.4 }}
             className="mt-20 relative rounded-[2rem] border border-white/10 bg-[#0f172a]/50 p-2 sm:p-4 shadow-2xl backdrop-blur-xl"
          >
             <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10 pointer-events-none rounded-[2rem]" />
             {/* Realistic Image placeholder or simplified UI representation */}
             <div className="rounded-[1.5rem] bg-[#020617] border border-white/5 h-[400px] md:h-[600px] w-full overflow-hidden flex relative">
                {/* Left Sidebar */}
                <div className="w-64 border-r border-white/5 bg-[#0f172a]/30 hidden md:flex flex-col p-4">
                   <div className="space-y-4">
                      <div className="h-8 w-full rounded bg-white/5 animate-pulse" />
                      <div className="h-8 w-3/4 rounded bg-white/5 animate-pulse" />
                      <div className="h-8 w-5/6 rounded bg-white/5 animate-pulse" />
                   </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 p-8 flex flex-col gap-6">
                   <div className="h-12 w-1/3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/10" />
                   <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                      <div className="text-center">
                         <Globe className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                         <p className="text-slate-400 font-medium">FlowStage Unified Workspace</p>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#020617] py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                 <Zap className="text-blue-400 h-5 w-5" />
                 <span className="text-lg font-bold">FlowStage</span>
              </div>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                {t("footer_tagline")}
              </p>
            </div>
            
            <div className="flex gap-10">
               <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-white">Platform</h4>
                  <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
                  <Link href="#channels" className="text-sm text-slate-400 hover:text-white transition-colors">Channels</Link>
               </div>
               <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-white">Legal</h4>
                  <Link href="/legal/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/legal/terms-of-service" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
               </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-sm text-slate-500">
             {t("developed_by")}
          </div>
        </div>
      </footer>
    </div>
  );
}
