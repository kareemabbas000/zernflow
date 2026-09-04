import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

export interface AiActionButtonProps extends ButtonProps {
  glow?: boolean
}

export const AiActionButton = React.forwardRef<HTMLButtonElement, AiActionButtonProps>(
  ({ className, glow = false, children, ...props }, ref) => {
    return (
      <div className={cn("relative inline-flex", className)}>
        {glow && (
          <div className="absolute inset-0 -inset-x-1 -inset-y-1 z-0 animate-pulse rounded-md bg-[var(--lilac)] opacity-20 blur-sm" />
        )}
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "relative z-10 border-[var(--lilac)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--lilac)] hover:text-white transition-colors",
            className
          )}
          {...props}
        >
          <Sparkles className="mr-2 h-4 w-4 text-[var(--lilac)] group-hover:text-white" />
          {children}
        </Button>
      </div>
    )
  }
)
AiActionButton.displayName = "AiActionButton"
