"use client";

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { Sparkles } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export function AuthLayout({ children, title, subtitle, testimonial }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30 flex">
      {/* Left Panel: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:left-12">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo size="md" showText={false} />
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
              FlowStage
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto mt-20 lg:mt-0">
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--ink)] mb-2">
            {title}
          </h1>
          <p className="text-[var(--ink-2)] font-medium mb-8">
            {subtitle}
          </p>
          
          {children}
        </div>
      </div>

      {/* Right Panel: Expressive Brand */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[var(--ink)] via-black to-[var(--ink-2)] overflow-hidden items-center justify-center p-12">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--brand)]/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--lilac)]/20 blur-[100px] rounded-full mix-blend-screen" />
        
        {testimonial ? (
          <div className="relative z-10 max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[32px] shadow-2xl">
            <div className="mb-6">
              <Sparkles className="w-8 h-8 text-[var(--brand-soft)]" />
            </div>
            <p className="text-xl font-bold leading-relaxed text-white mb-8">
              "{testimonial.quote}"
            </p>
            <div>
              <div className="font-bold text-white">{testimonial.author}</div>
              <div className="text-[var(--brand-soft)] font-medium text-sm">{testimonial.role}</div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[32px] shadow-2xl">
             <div className="w-full aspect-video rounded-xl bg-black/50 mb-6 flex items-center justify-center border border-white/10">
               <span className="text-white/50 font-display font-bold uppercase tracking-widest text-sm">Product Video</span>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Automate at the speed of thought.</h3>
             <p className="text-white/70 font-medium">Join 500+ teams building the future of customer operations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
