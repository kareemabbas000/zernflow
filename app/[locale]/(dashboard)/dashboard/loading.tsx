export default function DashboardLoading() {
  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded bg-[var(--surface-2)] border border-[var(--border)]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-md bg-[var(--surface-2)] border border-[var(--border)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-[var(--border)] bg-[var(--paper)] p-5 shadow-none"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-md bg-[var(--surface-2)]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-2)]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
              </div>
            </div>
            <div className="mt-6 h-3 w-32 animate-pulse rounded bg-[var(--surface-2)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
