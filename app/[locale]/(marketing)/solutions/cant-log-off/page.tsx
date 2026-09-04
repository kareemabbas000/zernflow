import * as React from "react"
import { ArrowRight, Coffee } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CantLogOffPage() {
  return (
    <div className="pt-32 pb-24 bg-[var(--paper)] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-[var(--coral)] mb-6">
            <span className="p-1.5 rounded-md text-white bg-[var(--coral)]">
              <Coffee className="w-4 h-4" />
            </span>
            THE PROBLEM
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-[var(--ink)] mb-6 leading-[1.1]">
            Can't log off? Burnout is real.
          </h1>
          <p className="text-xl text-[var(--ink-2)] font-medium leading-relaxed max-w-2xl mb-8">
            Answering the same "where is my order?" question 50 times a day drains your team's energy. Support teams get bogged down in repetitive queries instead of solving complex problems.
          </p>
          <div className="bg-[var(--surface-2)] p-6 md:p-8 rounded-3xl border border-[var(--border)] mb-12">
            <h3 className="font-bold text-lg text-[var(--ink)] mb-4">The FlowLoop Solution</h3>
            <p className="text-[var(--ink-2)] leading-relaxed mb-6">
              Deflect up to 70% of repetitive queries using visual workflows and AI. Let FlowLoop automatically fetch tracking numbers from Shopify and handle refunds, freeing up your team to tackle the 30% of tickets that actually require a human touch.
            </p>
            <ul className="space-y-3 font-medium text-[var(--ink)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)]" />
                Automate the repetitive busywork.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)]" />
                Seamless handoff to human agents when needed.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)]" />
                Keep your team happy and focused on high-value tasks.
              </li>
            </ul>
          </div>
          
          <Button asChild size="lg" className="rounded-full px-8 font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm">
            <Link href="/register">Automate the busywork <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
