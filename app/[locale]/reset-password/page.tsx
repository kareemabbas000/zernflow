"use client";

import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isReset, setIsReset] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate reset
    setTimeout(() => {
      setIsLoading(false)
      setIsReset(true)
    }, 1000)
  }

  if (isReset) {
    return (
      <AuthLayout
        title="Password reset successfully"
        subtitle="Your new password is now active."
      >
        <div className="space-y-6 text-center">
           <div className="w-16 h-16 bg-[var(--success-soft)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
           </div>
           <Button asChild className="w-full h-12 rounded-xl font-bold bg-[var(--ink)] text-white hover:bg-black mt-8">
              <Link href="/login">Continue to sign in</Link>
           </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--ink)]">New Password</label>
            <Input type="password" placeholder="••••••••" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--ink)]">Confirm Password</label>
            <Input type="password" placeholder="••••••••" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-[var(--ink)] text-white hover:bg-black mt-2">
            {isLoading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
