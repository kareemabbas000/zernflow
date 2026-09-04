import { getWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { CreateSequenceButton } from "@/components/sequences/create-sequence-button";
import type { SequenceStatus, Json } from "@/lib/types/database";

const statusConfig: Record<SequenceStatus, { label: string; classes: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-muted text-muted-foreground",
  },
  active: {
    label: "Active",
    classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  paused: {
    label: "Paused",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SequencesPage() {
  const { workspace, supabase } = await getWorkspace();

  const { data: sequences } = await supabase
    .from("sequences")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false });

  // Get enrollment counts per sequence
  const sequenceIds = (sequences ?? []).map((s) => s.id);
  let enrollmentCounts: Record<string, number> = {};

  if (sequenceIds.length > 0) {
    const { data: counts } = await supabase
      .from("sequence_enrollments")
      .select("sequence_id")
      .in("sequence_id", sequenceIds)
      .eq("status", "active");

    if (counts) {
      enrollmentCounts = counts.reduce<Record<string, number>>((acc, row) => {
        acc[row.sequence_id] = (acc[row.sequence_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="border-b border-border/40 bg-background/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <ListOrdered className="h-7 w-7 text-primary" />
              Sequences
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create drip campaigns to nurture contacts over time
            </p>
          </div>
          <CreateSequenceButton />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6 relative z-10 custom-scrollbar">
      {!sequences || sequences.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border py-24 text-center bg-card/40 backdrop-blur-md">
          <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 text-base font-semibold text-foreground">No sequences yet</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Create your first sequence to start nurturing contacts automatically with timed messages.
          </p>
          <div className="mt-5">
            <CreateSequenceButton />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sequences.map((sequence) => {
            const status =
              statusConfig[sequence.status as SequenceStatus] ?? statusConfig.draft;
            const steps = Array.isArray(sequence.steps)
              ? sequence.steps
              : [];
            const stepCount = steps.length;
            const enrolled = enrollmentCounts[sequence.id] || 0;

            return (
              <Link
                key={sequence.id}
                href={`/dashboard/sequences/${sequence.id}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <ListOrdered className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {sequence.name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stepCount} {stepCount === 1 ? "step" : "steps"}
                        {enrolled > 0 && (
                          <span className="ml-2 font-medium text-foreground">
                            • {enrolled} enrolled
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {sequence.description && (
                    <p className="mt-4 text-xs text-muted-foreground line-clamp-2">
                      {sequence.description}
                    </p>
                  )}
                  <div className="mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
                    <span>Updated {formatDate(sequence.updated_at || sequence.created_at || "")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
