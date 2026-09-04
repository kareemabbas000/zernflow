"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const locales = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" }
]

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: string) => {
    // pathname usually looks like /en/about or /ar/about
    // We split it and replace the first segment if it's a locale
    const segments = pathname.split('/')
    if (segments[1] === 'en' || segments[1] === 'ar') {
      segments[1] = newLocale
      router.push(segments.join('/'))
    } else {
      router.push(`/${newLocale}${pathname}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full text-[var(--ink)]">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[var(--surface)] border-[var(--border)]">
        {locales.map((locale) => (
          <DropdownMenuItem 
            key={locale.code} 
            onClick={() => switchLocale(locale.code)}
            className="text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            {locale.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
