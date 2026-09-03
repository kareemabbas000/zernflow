"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      
      <h2 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong!</h2>
      
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error while loading this page. Our team has been notified. 
        You can try reloading the page or return to the dashboard.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl text-left">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-mono text-xs text-red-500 mb-2">Development Details:</p>
            <pre className="overflow-auto text-[10px] text-muted-foreground">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
