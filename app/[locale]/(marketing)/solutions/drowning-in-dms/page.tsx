import * as React from "react"
import { ArrowRight, Inbox } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DrowningInDMsPage() {
  return (
    <div className="pt-32 pb-24 bg-[var(--paper)] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-[var(--brand)] mb-6">
            <span className="p-1.5 rounded-md text-white bg-[var(--brand)]">
              <Inbox className="w-4 h-4" />
            </span>
            THE PROBLEM
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-[var(--ink)] mb-6 leading-[1.1]">
            Drowning in DMs across five different apps?
          </h1>
          <p className="text-xl text-[var(--ink-2)] font-medium leading-relaxed max-w-2xl mb-8">
            Your customers are messaging you on WhatsApp, sliding into your Instagram DMs, replying to your marketing emails, and texting you. Keeping up requires 10 tabs and constant context switching.
          </p>
          <div className="bg-[var(--surface-2)] p-6 md:p-8 rounded-3xl border border-[var(--border)] mb-12">
            <h3 className="font-bold text-lg text-[var(--ink)] mb-4">The FlowLoop Solution</h3>
            <p className="text-[var(--ink-2)] leading-relaxed mb-6">
              Connect all your channels into a single, unified Inbox. When a customer messages you on Instagram, and follows up on WhatsApp, you see the entire thread in one place. No tabs, no lost messages.
            </p>
            <ul className="space-y-3 font-medium text-[var(--ink)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                Native integrations for WhatsApp, Instagram, and SMS.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                Centralized customer profiles.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                AI auto-tagging to prioritize VIP customers.
              </li>
            </ul>
          </div>
          
          <Button asChild size="lg" className="rounded-full px-8 font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm">
            <Link href="/register">Start unifying your inbox <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
