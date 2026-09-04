"use client";

import * as React from "react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-40 lg:pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ink-2)] hover:text-[var(--brand)] transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <header className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-[var(--brand)] uppercase tracking-wider bg-[var(--brand-soft)] px-3 py-1 rounded-full">Product</span>
              <span className="text-sm font-medium text-[var(--ink-3)]">Oct 24, 2024</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-8">
              Introducing FlowStage 2.0: The AI-Native Era
            </h1>
            <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/150?u=author" alt="Author" className="w-12 h-12 rounded-full border border-[var(--border)]" />
              <div>
                <div className="font-bold text-[var(--ink)]">Sarah Jenkins</div>
                <div className="text-sm font-medium text-[var(--ink-3)]">Head of Product</div>
              </div>
            </div>
          </header>

          <div className="w-full aspect-video rounded-3xl bg-[var(--brand)] mb-16 overflow-hidden flex items-center justify-center opacity-90">
             <span className="font-display font-black text-6xl text-white opacity-50 uppercase tracking-widest">PRODUCT</span>
          </div>

          <article className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--brand)] hover:prose-a:text-[var(--brand-hover)] prose-p:text-[var(--ink-2)] prose-p:font-medium prose-p:leading-relaxed">
            <p>
              Today, we're thrilled to announce the biggest update in our company's history. We've completely rebuilt the FlowStage engine from the ground up to make visual automation 10x faster, and we've brought Large Language Models (LLMs) natively into every node of the canvas.
            </p>
            <h2>The problem with traditional chatbots</h2>
            <p>
              For years, the industry has relied on strict, rigid decision trees. If a user asked a question slightly outside the expected parameters, the bot failed. It was frustrating for customers, and embarrassing for brands.
            </p>
            <p>
              We realized that to truly solve automated customer operations, we couldn't just patch the old system. We had to rethink the physics of how a conversation flows.
            </p>
            <h2>Enter the AI Copilot Node</h2>
            <p>
              With FlowStage 2.0, you can drag an "AI Copilot" node right onto your canvas. You simply prompt it with your business rules and attach your knowledge base. When a user reaches this node, the AI takes over dynamically, ensuring human-like, accurate responses.
            </p>
            <blockquote>
              "It's not just a feature; it's a paradigm shift. We're moving from 'if-this-then-that' to 'understand-and-resolve'."
            </blockquote>
            <h2>Available Today</h2>
            <p>
              FlowStage 2.0 is rolling out today for all Professional and Enterprise customers. We can't wait to see what you build.
            </p>
          </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
