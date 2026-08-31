"use client";

import { useUIStore, selectIsMobile } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export function ResponsiveLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useUIStore(selectIsMobile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden",
        mounted && isMobile ? "pb-16" : "" // Account for fixed bottom nav on mobile
      )}
    >
      {children}
    </div>
  );
}
