import type { CandidateStage } from "@/lib/data";
import { cn } from "@/lib/utils";

const styles: Record<CandidateStage, string> = {
  Applied: "bg-muted text-muted-foreground",
  Screening: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  Shortlisted: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  Interview: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Final Review": "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
  Offer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Hired: "bg-emerald-600 text-white",
  Rejected: "bg-destructive/10 text-destructive",
};

export function StageChip({ stage, className }: { stage: CandidateStage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[stage],
        className,
      )}
    >
      {stage}
    </span>
  );
}
