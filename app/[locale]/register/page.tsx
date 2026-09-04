"use client";

import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
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
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      router.push("/onboarding")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of teams automating their operations."
    >
      <div className="space-y-6">


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-primary)]">First Name</label>
              <Input name="firstName" type="text" placeholder="Jane" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-[var(--text-primary)]">Last Name</label>
              <Input name="lastName" type="text" placeholder="Doe" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--text-primary)]">Work Email</label>
            <Input name="email" type="email" placeholder="jane@company.com" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--text-primary)]">Password</label>
            <Input name="password" type="password" placeholder="••••••••" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-[var(--text-primary)] text-[var(--bg)] hover:opacity-90 mt-2">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          {error && (
            <p className="text-sm font-medium text-[var(--danger)] text-center mt-2">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-xs font-medium text-[var(--text-muted)] leading-relaxed mt-4">
          By signing up, you agree to our{" "}
          <Link href="/legal/terms-of-service" className="font-bold hover:text-[var(--text-primary)]">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/legal/privacy-policy" className="font-bold hover:text-[var(--text-primary)]">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm font-medium text-[var(--text-secondary)] mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
