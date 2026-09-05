"use client";

import { usePathname } from "next/navigation";

export function DashboardPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = pathname.includes("/inbox");

  if (isFullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {children}
    </div>
  );
}
