import * as React from "react"
import { ArrowRight, Moon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LosingLeadsPage() {
  return (
    <div className="pt-32 pb-24 bg-[var(--paper)] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-[var(--warning)] mb-6">
            <span className="p-1.5 rounded-md text-white bg-[var(--warning)]">
              <Moon className="w-4 h-4" />
            </span>
            THE PROBLEM
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-[var(--ink)] mb-6 leading-[1.1]">
            Losing leads while you sleep?
          </h1>
          <p className="text-xl text-[var(--ink-2)] font-medium leading-relaxed max-w-2xl mb-8">
            Customers expect instant responses 24/7. When they message you at 2 AM asking about sizing or availability, and you don't reply until 9 AM, they've already bought from your competitor.
          </p>
          <div className="bg-[var(--surface-2)] p-6 md:p-8 rounded-3xl border border-[var(--border)] mb-12">
            <h3 className="font-bold text-lg text-[var(--ink)] mb-4">The FlowStage Solution</h3>
            <p className="text-[var(--ink-2)] leading-relaxed mb-6">
              Deploy an AI Copilot that never sleeps. Our models ingest your knowledge base and can instantly answer pre-sales questions, recommend products, and even capture lead information in the middle of the night.
            </p>
            <ul className="space-y-3 font-medium text-[var(--ink)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Zero-delay responses, 24/7.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Train the AI on your exact product catalog.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Automatically capture emails and sync to CRM.
              </li>
            </ul>
          </div>
          
          <Button asChild size="lg" className="rounded-full px-8 font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm">
            <Link href="/register">Stop losing leads <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
