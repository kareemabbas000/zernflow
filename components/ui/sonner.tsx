"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--surface)] group-[.toaster]:text-[var(--ink)] group-[.toaster]:border-[var(--border)] group-[.toaster]:shadow-sm group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-[var(--ink-2)]",
          actionButton:
            "group-[.toast]:bg-[var(--ink)] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[var(--surface-2)] group-[.toast]:text-[var(--ink)]",
          success: "group-[.toaster]:bg-[var(--success-soft)] group-[.toaster]:text-[var(--success)] group-[.toaster]:border-[var(--success)]",
          error: "group-[.toaster]:bg-[var(--danger-soft)] group-[.toaster]:text-[var(--danger)] group-[.toaster]:border-[var(--danger)]",
          info: "group-[.toaster]:bg-[var(--info-soft)] group-[.toaster]:text-[var(--info)] group-[.toaster]:border-[var(--info)]",
          warning: "group-[.toaster]:bg-[var(--warning-soft)] group-[.toaster]:text-[var(--warning)] group-[.toaster]:border-[var(--warning)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
