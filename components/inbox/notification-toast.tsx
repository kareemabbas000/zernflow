"use client";

import { X } from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/types/database";

interface NotificationToastProps {
  toastId: string | number;
  senderName: string;
  preview: string;
  platform: Platform;
  avatarUrl?: string | null;
  onDismiss: (id: string | number) => void;
  onClick: () => void;
}

export function NotificationToast({
  toastId,
  senderName,
  preview,
  platform,
  avatarUrl,
  onDismiss,
  onClick,
}: NotificationToastProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex w-[350px] max-w-[90vw] cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)]",
        "bg-white/95 dark:bg-black/95 backdrop-blur-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-[var(--surface)]/90",
        "overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
      )}
    >
      {/* Decorative side accent matching platform color */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          platform === "facebook" ? "bg-blue-600" :
          platform === "instagram" ? "bg-pink-600" :
          platform === "whatsapp" ? "bg-emerald-500" :
          platform === "telegram" ? "bg-sky-500" :
          "bg-primary"
        )} 
      />

      <div className="relative shrink-0 ml-1">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--surface)] shadow-sm"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-[var(--surface)] shadow-sm font-bold uppercase">
            {senderName.charAt(0)}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 rounded-full bg-[var(--surface)] p-0.5 shadow-sm border border-[var(--border)]">
          <PlatformIcon platform={platform as any} className="h-3.5 w-3.5" size={14} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden pr-6">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-bold text-[var(--ink)] leading-none mt-0.5">
            {senderName}
          </p>
          <span className="shrink-0 text-[10px] font-medium text-[var(--brand)] uppercase tracking-wider bg-[var(--brand)]/10 px-1.5 py-0.5 rounded-full">
            New
          </span>
        </div>
        <p className="line-clamp-2 text-xs font-medium text-[var(--ink-2)] leading-relaxed">
          {preview}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toastId);
        }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-3)] opacity-0 transition-all hover:bg-[var(--surface-2)] hover:text-[var(--ink)] group-hover:opacity-100"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
