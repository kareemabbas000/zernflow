import * as React from "react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/platform-icon";
import type { Platform } from "@/lib/types/database";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  fallback?: string;
  platform?: Platform | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const GRADIENT_PALETTES = [
  "from-violet-500/20 to-purple-500/30 text-purple-600 dark:text-purple-300 border-purple-500/20",
  "from-blue-500/20 to-cyan-500/30 text-blue-600 dark:text-blue-300 border-blue-500/20",
  "from-emerald-500/20 to-teal-500/30 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
  "from-amber-500/20 to-orange-500/30 text-amber-600 dark:text-amber-300 border-amber-500/20",
  "from-rose-500/20 to-pink-500/30 text-rose-600 dark:text-rose-300 border-rose-500/20",
  "from-indigo-500/20 to-blue-600/30 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
];

function getInitials(name?: string | null, fallback?: string): string {
  if (fallback) return fallback.slice(0, 2).toUpperCase();
  if (!name) return "?";
  
  const cleanName = name.replace(/^[@#+]/, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (cleanName.length >= 2) {
    return cleanName.slice(0, 2).toUpperCase();
  }
  return cleanName.slice(0, 1).toUpperCase() || "?";
}

function getGradient(name?: string | null): string {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

const SIZE_STYLES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const BADGE_STYLES = {
  xs: "h-3 w-3 -bottom-0.5 -right-0.5",
  sm: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  md: "h-4.5 w-4.5 -bottom-0.5 -right-0.5",
  lg: "h-5 w-5 -bottom-0.5 -right-0.5",
  xl: "h-6 w-6 -bottom-1 -right-1",
};

function Avatar({
  className,
  src,
  name,
  fallback,
  platform,
  size = "md",
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(name, fallback);
  const gradientClass = getGradient(name || initials);
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;
  const badgeSizeClass = BADGE_STYLES[size] || BADGE_STYLES.md;

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-border/50 select-none shadow-xs",
          sizeClass
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br font-bold border",
              gradientClass
            )}
          >
            {initials}
          </div>
        )}
      </div>

      {platform && (
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-background bg-background shadow-xs",
            badgeSizeClass
          )}
        >
          <PlatformIcon
            platform={platform}
            className="h-full w-full p-0.5"
            size={size === "xs" || size === "sm" ? 8 : 12}
          />
        </div>
      )}
    </div>
  );
}

export { Avatar };
