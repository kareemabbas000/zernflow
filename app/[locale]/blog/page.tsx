"use client";

import * as React from "react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "introducing-flowstage-2",
    title: "Introducing FlowStage 2.0",
    excerpt: "A complete rebuild of our engine, making visual automation 10x faster and bringing AI natively into every node.",
    date: "Oct 24, 2024",
    category: "Product",
    color: "bg-[var(--brand)]"
  },
  {
    slug: "how-to-automate-whatsapp",
    title: "How to automate WhatsApp without losing the human touch",
    excerpt: "The playbook for routing VIP customers to human agents while AI handles the 80% of repetitive FAQs.",
    date: "Oct 12, 2024",
    category: "Guides",
    color: "bg-[var(--lilac)]"
  },
  {
    slug: "why-we-ditched-chatbots",
    title: "Why we ditched chatbots for AI Copilots",
    excerpt: "Traditional decision-tree chatbots are dead. Here's why we rebuilt our entire platform around LLM-powered copilots.",
    date: "Sep 28, 2024",
    category: "Engineering",
    color: "bg-[var(--coral)]"
  }
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--brand)]/30">
      <MarketingNav />
      <main className="pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-[var(--ink)] mb-6">
              The FlowStage <span className="text-[var(--brand)]">Blog.</span>
            </h1>
            <p className="text-xl text-[var(--ink-2)] font-medium max-w-2xl leading-relaxed">
              Thoughts on product, engineering, and the future of automated customer operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className={`h-48 w-full ${post.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                   {/* Placeholder for actual blog cover art */}
                   <span className="font-display font-black text-4xl text-white opacity-50 uppercase tracking-widest">{post.category}</span>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-bold text-[var(--brand)] uppercase tracking-wider">{post.category}</span>
                    <span className="text-xs font-medium text-[var(--ink-3)]">{post.date}</span>
                  </div>
                  <h3 className="font-bold text-2xl text-[var(--ink)] mb-4 leading-tight group-hover:text-[var(--brand)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[var(--ink-2)] font-medium leading-relaxed mb-8 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center font-bold text-[var(--ink)] text-sm group-hover:text-[var(--brand)] transition-colors mt-auto">
                    Read article <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
