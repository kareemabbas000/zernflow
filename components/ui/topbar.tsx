import * as React from "react"
import { cn } from "@/lib/utils"

export interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Topbar({ className, children, ...props }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}
