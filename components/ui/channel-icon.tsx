import * as React from "react"
import { PlatformIcon } from "@/components/platform-icon"
import type { Platform } from "@/lib/types/database"
import { cn } from "@/lib/utils"

export interface ChannelIconProps extends React.HTMLAttributes<HTMLDivElement> {
  platform: Platform
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
}

const containerSizeMap = {
  sm: "h-6 w-6 rounded-md",
  md: "h-10 w-10 rounded-lg",
  lg: "h-14 w-14 rounded-xl",
}

export function ChannelIcon({ platform, size = "md", className, ...props }: ChannelIconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[var(--surface-2)] shadow-sm border border-[var(--border)]",
        containerSizeMap[size],
        className
      )}
      {...props}
    >
      <PlatformIcon platform={platform} size={sizeMap[size]} />
    </div>
  )
}
