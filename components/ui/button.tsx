import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]",
        destructive: "bg-[var(--danger)] text-white hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]",
        outline: "border border-[var(--border-strong)] bg-transparent hover:bg-[var(--surface-2)] text-[var(--ink)]",
        secondary: "bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)]",
        ghost: "hover:bg-[var(--surface-2)] text-[var(--ink)]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline",
        icon: "hover:bg-[var(--surface-2)] text-[var(--ink)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        pill: "h-12 rounded-full px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
