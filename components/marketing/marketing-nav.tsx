"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MarketingNav() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  })

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--paper)]/80 backdrop-blur-lg border-b border-[var(--border)] shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:flex-1">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo size="md" showText={false} />
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
              FlowStage
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex lg:gap-x-12">
          {/* Add links here if needed. According to prompt, focus on CTAs mostly. */}
          <Link href="#features" className="text-sm font-semibold leading-6 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-semibold leading-6 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm font-semibold leading-6 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-6">
          <Link href="/login" className="text-sm font-semibold leading-6 text-[var(--ink)] hover:text-[var(--brand)] transition-colors">
            Sign in
          </Link>
          <Button asChild size="lg" className="rounded-full px-6 font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm">
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[var(--ink)]">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm bg-[var(--paper)] p-6">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <BrandLogo size="md" showText={false} />
                  <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
                    FlowStage
                  </span>
                </Link>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-[var(--border)]">
                  <div className="space-y-2 py-6">
                    <Link
                      href="#features"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      How it works
                    </Link>
                    <Link
                      href="#pricing"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                  </div>
                  <div className="py-6 flex flex-col gap-4">
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[var(--ink)] hover:bg-[var(--surface-2)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Button asChild size="lg" className="w-full rounded-full font-bold bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-sm mt-4">
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started Free</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}
