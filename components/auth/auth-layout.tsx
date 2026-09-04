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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-[var(--brand)]/30 flex">
      {/* Left Panel: Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="pt-8 pb-12">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <BrandLogo size="md" showText={false} />
            <span className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
              FlowStage
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto pb-24 lg:pb-0">
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--text-primary)] mb-2">
            {title}
          </h1>
          <p className="text-[var(--text-secondary)] font-medium mb-8">
            {subtitle}
          </p>
          
          {children}
        </div>
      </div>

      {/* Right Panel: Expressive Brand */}
      <div className="hidden lg:flex flex-1 relative bg-[var(--marketing-deep)] overflow-hidden items-center justify-center p-12">
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
          <div className="relative z-10 max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[32px] shadow-2xl overflow-hidden group">
            {/* Aesthetic Graphic Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
            
            <div className="w-full aspect-video rounded-2xl bg-black/40 border border-white/10 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              
              {/* Floating nodes visual */}
              <div className="flex gap-4 items-center absolute z-0 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                 <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/20 border border-[var(--brand)]/50 flex items-center justify-center shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)] animate-pulse">
                   <div className="w-6 h-6 rounded-md bg-[var(--brand)]" />
                 </div>
                 <div className="w-8 h-0.5 bg-gradient-to-r from-[var(--brand)] to-[var(--lilac)] opacity-50" />
                 <div className="w-12 h-12 rounded-xl bg-[var(--lilac)]/20 border border-[var(--lilac)]/50 flex items-center justify-center shadow-[0_0_15px_rgba(var(--lilac-rgb),0.3)]">
                   <div className="w-6 h-6 rounded-md bg-[var(--lilac)]" />
                 </div>
              </div>
              
              <div className="relative z-20 text-center mt-12">
                 <Sparkles className="w-6 h-6 text-white/50 mx-auto mb-2" />
                 <span className="text-white font-display font-bold text-sm tracking-wider uppercase">Visual Studio</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3">Automate at the speed of thought.</h3>
            <p className="text-white/70 font-medium text-lg leading-relaxed">
              Join 500+ teams building the future of customer operations with AI-native workflows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
