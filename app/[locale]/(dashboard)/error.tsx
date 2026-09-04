"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--paper)]">
      <div className="max-w-md w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md p-6 text-center">
        <div className="w-12 h-12 bg-[var(--danger-soft)] rounded-md flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-[var(--danger)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--ink)] mb-2">
          Unable to load this view
        </h2>
        <p className="text-sm text-[var(--ink-2)] mb-6">
          We encountered a problem while rendering this page. You can try reloading, or contact support if the issue persists.
        </p>
        <button 
          onClick={() => reset()} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ink)] text-white text-sm font-medium rounded-md hover:bg-black transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
