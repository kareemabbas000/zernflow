"use client";

import * as React from "react"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MessageCircle, Mail } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-[var(--ink-2)] mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" />
              <span>We're here to help</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-6">
              Let's talk about <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--brand-hover)]">your workflows.</span>
            </h1>
            <p className="text-xl text-[var(--ink-2)] font-medium mb-12 max-w-lg leading-relaxed">
              Have a complex routing problem? Need a custom SLA? Or just want to say hi? Drop us a line.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)]">Support</h3>
                  <p className="text-sm font-medium text-[var(--ink-3)]">support@flowstage.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--lilac)]/20 text-[var(--lilac)] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)]">Sales</h3>
                  <p className="text-sm font-medium text-[var(--ink-3)]">sales@flowstage.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-[var(--border)]">
            {isSubmitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[var(--success-soft)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--ink)] mb-2">Message received!</h3>
                <p className="text-[var(--ink-2)] font-medium">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--ink)]">First Name</label>
                    <Input placeholder="Jane" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--ink)]">Last Name</label>
                    <Input placeholder="Doe" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--ink)]">Work Email</label>
                  <Input type="email" placeholder="jane@company.com" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--ink)]">How can we help?</label>
                  <Textarea placeholder="Tell us about your team and what you're trying to achieve..." required className="min-h-[150px] rounded-xl bg-[var(--surface)] border-[var(--border)] resize-none" />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 rounded-full font-bold text-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-md transition-transform hover:scale-[1.02]">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
