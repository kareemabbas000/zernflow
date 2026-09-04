"use client"

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

export function MarketingFooter() {
  return (
    <footer className="bg-[var(--ink)] text-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <BrandLogo size="md" showText={false} />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                FlowStage
              </span>
            </Link>
            <p className="text-[var(--ink-3)] text-sm font-medium leading-relaxed max-w-xs">
              Intelligent automation for modern customer operations. Built with speed and scale in mind.
            </p>
          </div>

          {/* Problems (Pain-based Links) */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white mb-2">Problems</h4>
            <Link href="/solutions/drowning-in-dms" className="text-[var(--ink-3)] text-sm font-medium hover:text-[var(--lime)] transition-colors">
              Drowning in DMs
            </Link>
            <Link href="/solutions/losing-leads" className="text-[var(--ink-3)] text-sm font-medium hover:text-[var(--lime)] transition-colors">
              Losing leads overnight
            </Link>
            <Link href="/solutions/cant-log-off" className="text-[var(--ink-3)] text-sm font-medium hover:text-[var(--lime)] transition-colors">
              Can't log off
            </Link>
            <Link href="/solutions/dev-bottleneck" className="text-[var(--ink-3)] text-sm font-medium hover:text-[var(--lime)] transition-colors">
              Waiting on engineering
            </Link>
          </div>

          {/* Legal / Company */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white mb-2">Company</h4>
            <Link href="/about" className="text-[var(--ink-3)] text-sm font-medium hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-[var(--ink-3)] text-sm font-medium hover:text-white transition-colors">
              Contact Sales
            </Link>
            <Link href="/legal/privacy-policy" className="text-[var(--ink-3)] text-sm font-medium hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms-of-service" className="text-[var(--ink-3)] text-sm font-medium hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--ink-3)] text-sm font-medium">
            &copy; {new Date().getFullYear()} FlowStage Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[var(--ink-3)] hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
              </svg>
            </a>
            <a href="#" className="text-[var(--ink-3)] hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
