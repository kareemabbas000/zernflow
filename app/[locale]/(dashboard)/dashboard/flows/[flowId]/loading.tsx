import { Loader2 } from "lucide-react";

export default function FlowStudioLoading() {
  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Top Studio Bar Skeleton */}
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      {/* Canvas Workspace Skeleton */}
      <div className="relative flex flex-1 items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Opening Flow Studio...
          </p>
        </div>
      </div>
    </div>
  );
}
