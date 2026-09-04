"use client";

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your workspace."
      testimonial={{
        quote: "FlowStage completely replaced our chaotic support inbox. It's just calm now.",
        author: "Marcus Thorne",
        role: "Founder, Zenith"
      }}
    >
      <div className="space-y-6">


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--text-primary)]">Email</label>
            <Input name="email" type="email" placeholder="jane@company.com" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--text-primary)]">Password</label>
              <Link href="/forgot-password" className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
                Forgot password?
              </Link>
            </div>
            <Input name="password" type="password" placeholder="••••••••" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 mt-2">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          {error && (
            <p className="text-sm font-medium text-[var(--danger)] text-center mt-2">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-sm font-medium text-[var(--text-secondary)] mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
