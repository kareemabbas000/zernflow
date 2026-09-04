import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { PlatformIcon } from "@/components/platform-icon"
import type { Platform } from "@/lib/types/database"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null
  fallback?: string | null
  name?: string | null
  platform?: Platform
}

const GRADIENT_PALETTES = [
  "from-[var(--brand)] to-[var(--brand-hover)] text-white",
  "from-[var(--success)] to-green-600 text-white",
  "from-[var(--warning)] to-orange-600 text-white",
  "from-[var(--danger)] to-red-600 text-white",
  "from-[var(--lilac)] to-purple-600 text-white",
]

function getGradient(name?: string): string {
  if (!name) return GRADIENT_PALETTES[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length]
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, fallback, name, platform, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)

    React.useEffect(() => {
      setHasError(false)
    }, [src])

    const textToUse = fallback || name
    const gradientClass = getGradient(textToUse || undefined)

    const avatarContent = (
      <div
        ref={platform ? undefined : ref}
        className={cn(avatarVariants({ size, className }), "ring-1 ring-[var(--border)]")}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={textToUse || "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br font-semibold",
              gradientClass
            )}
          >
            {textToUse?.slice(0, 2).toUpperCase() || "?"}
          </div>
        )}
      </div>
    )

    if (platform) {
      return (
        <div className="relative inline-flex" ref={ref}>
          {avatarContent}
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--surface)] ring-1 ring-[var(--border)]">
            <PlatformIcon platform={platform} size={10} />
          </div>
        </div>
      )
    }

    return avatarContent
  }
)
Avatar.displayName = "Avatar"

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center -space-x-3", className)}
    {...props}
  />
))
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarGroup, avatarVariants }
