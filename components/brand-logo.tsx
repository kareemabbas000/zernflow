import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
}

export function BrandLogo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-xl tracking-tight",
    xl: "text-2xl tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Dynamic Geometric KA COMM Symbol */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#581C87] via-[#6C2BFF] to-[#00C2FF] p-0.5 shadow-md shadow-[#6C2BFF]/25",
          iconSizes[size]
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B1020] p-1.5 transition-transform">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full drop-shadow-[0_2px_8px_rgba(108,43,255,0.6)]"
          >
            {/* Communication Signal Arcs */}
            <path
              d="M20 7C23.3137 7 26 9.68629 26 13"
              stroke="#00C2FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-90"
            />
            <path
              d="M20 10.5C21.3807 10.5 22.5 11.6193 22.5 13"
              stroke="#FF3D81"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-80"
            />

            {/* Stylized 'K' */}
            <path
              d="M7 6V26"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M17 7L7 16L17 26"
              stroke="url(#ka-gradient)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Signal Node Dot */}
            <circle cx="20" cy="13" r="1.5" fill="#00C2FF" />

            <defs>
              <linearGradient id="ka-gradient" x1="7" y1="7" x2="18" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00C2FF" />
                <stop offset="0.5" stopColor="#A855F7" />
                <stop offset="1" stopColor="#FF3D81" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex items-center font-extrabold font-sans">
          <span className={cn("text-foreground font-black tracking-tight", textSizes[size], textClassName)}>
            KA
          </span>
          <span
            className={cn(
              "ml-1.5 bg-gradient-to-r from-[#6C2BFF] via-[#9333EA] to-[#00C2FF] bg-clip-text font-black text-transparent tracking-wider",
              textSizes[size],
              textClassName
            )}
          >
            COMM
          </span>
        </div>
      )}
    </div>
  );
}
