"use client";

import * as React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
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
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-xl font-bold border-[var(--border)]">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-12 rounded-xl font-bold border-[var(--border)]">
            <svg className="w-5 h-5 mr-2 text-[#181717]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--paper)] px-2 text-[var(--ink-3)] font-bold">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-[var(--ink)]">Email</label>
            <Input type="email" placeholder="jane@company.com" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--ink)]">Password</label>
              <Link href="/forgot-password" className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
                Forgot password?
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" required className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)]" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-[var(--ink)] text-white hover:bg-black mt-2">
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-[var(--ink-2)] mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-[var(--brand)] hover:text-[var(--brand-hover)]">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
