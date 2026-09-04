"use client";

import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate sending email
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1000)
  }

  if (isSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a secure link to reset your password."
      >
        <div className="space-y-6 text-center">
           <div className="w-16 h-16 bg-[var(--success-soft)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-8 h-8" />
           </div>
           <p className="text-[var(--ink-2)] font-medium">
             Didn't receive it? Check your spam folder or <button onClick={() => setIsSent(false)} className="text-[var(--brand)] font-bold hover:underline">try again</button>.
           </p>
           <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold mt-8 border-[var(--border)]">
              <Link href="/login">Back to sign in</Link>
           </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a recovery link."
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--ink)]">Email</label>
            <Input type="email" placeholder="jane@company.com" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-[var(--ink)] text-white hover:bg-black mt-2">
            {isLoading ? "Sending link..." : "Send recovery link"}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-[var(--ink-2)] mt-8">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
