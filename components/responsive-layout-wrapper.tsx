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

  // 
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      className={cn(
        "flex h-[100dvh] w-full min-w-0 overflow-hidden overflow-x-hidden",
        mounted && isMobile ? "pb-16" : "" // Account for fixed bottom nav on mobile
      )}
    >
      {children}
    </div>
  );
}
