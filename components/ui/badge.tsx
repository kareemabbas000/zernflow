import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]",
        secondary: "border-transparent bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)]",
        destructive: "border-transparent bg-[var(--danger)] text-white hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]",
        outline: "text-[var(--ink)] border-[var(--border-strong)]",
        success: "border-transparent bg-[var(--success-soft)] text-[var(--success)]",
        warning: "border-transparent bg-[var(--warning-soft)] text-[var(--warning)]",
        error: "border-transparent bg-[var(--danger-soft)] text-[var(--danger)]",
        info: "border-transparent bg-[var(--info-soft)] text-[var(--info)]",
        neutral: "border-transparent bg-[var(--surface-2)] text-[var(--ink-3)]",
        ai: "border-transparent bg-[var(--lilac)] text-[var(--ink)] shadow-[0_0_8px_rgba(200,182,255,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
