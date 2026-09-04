import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusDotVariants = cva(
  "inline-block rounded-full",
  {
    variants: {
      status: {
        online: "bg-[var(--success)] shadow-[0_0_8px_rgba(34,197,94,0.4)]",
        offline: "bg-[var(--ink-3)]",
        away: "bg-[var(--warning)] shadow-[0_0_8px_rgba(245,158,11,0.4)]",
        busy: "bg-[var(--danger)] shadow-[0_0_8px_rgba(239,68,68,0.4)]",
        ai: "bg-[var(--lilac)] shadow-[0_0_8px_rgba(200,182,255,0.6)] animate-pulse",
      },
      size: {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
      },
    },
    defaultVariants: {
      status: "online",
      size: "md",
    },
  }
)

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  ping?: boolean
}

export function StatusDot({
  status,
  size,
  ping,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span className="relative flex items-center justify-center">
      {ping && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            status === "online" && "bg-[var(--success)]",
            status === "away" && "bg-[var(--warning)]",
            status === "busy" && "bg-[var(--danger)]",
            status === "ai" && "bg-[var(--lilac)]",
            status === "offline" && "bg-[var(--ink-3)]"
          )}
        />
      )}
      <span
        className={cn(statusDotVariants({ status, size }), className)}
        {...props}
      />
    </span>
  )
}
