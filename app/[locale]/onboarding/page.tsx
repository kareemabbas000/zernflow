"use client";

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight, Building, Users } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      setIsLoading(true)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col font-sans selection:bg-[var(--brand)]/30">
      <header className="p-6 md:p-8">
        <Link href="/" className="flex items-center gap-2 group w-max">
          <BrandLogo size="md" showText={false} />
          <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
            FlowStage
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 text-center">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-[var(--brand-soft)] text-[var(--brand)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Building className="w-8 h-8" />
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-[var(--ink)] mb-4">
                Name your workspace
              </h1>
              <p className="text-[var(--ink-2)] font-medium mb-8">
                This is usually your company or team name. You can change this later.
              </p>
              <div className="space-y-6 text-left">
                <Input 
                  autoFocus
                  placeholder="e.g. Acme Corp" 
                  className="h-14 text-lg rounded-xl bg-white border-[var(--border)] shadow-sm"
                />
                <Button onClick={handleNext} size="lg" className="w-full h-14 rounded-xl font-bold bg-[var(--ink)] text-white hover:bg-black text-lg">
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-[var(--lilac)]/20 text-[var(--lilac)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight text-[var(--ink)] mb-4">
                Invite your team
              </h1>
              <p className="text-[var(--ink-2)] font-medium mb-8">
                FlowStage works best when the whole team is collaborating.
              </p>
              <div className="space-y-4 text-left mb-6">
                <Input 
                  placeholder="colleague@company.com" 
                  className="h-14 rounded-xl bg-white border-[var(--border)] shadow-sm"
                />
                <Input 
                  placeholder="colleague2@company.com" 
                  className="h-14 rounded-xl bg-white border-[var(--border)] shadow-sm"
                />
                <button className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">+ Add another</button>
              </div>
              <div className="space-y-4">
                <Button onClick={handleNext} disabled={isLoading} size="lg" className="w-full h-14 rounded-xl font-bold bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] text-lg shadow-md">
                  {isLoading ? "Setting up workspace..." : "Send invites and finish"}
                </Button>
                <Button onClick={handleNext} variant="ghost" className="w-full h-12 rounded-xl font-bold text-[var(--ink-3)] hover:text-[var(--ink)]">
                  Skip for now
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
