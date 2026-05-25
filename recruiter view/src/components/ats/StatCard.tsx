import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, delta, accent, index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: number;
  accent?: boolean;
  index?: number;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md",
        accent && "bg-gradient-to-br from-primary/5 via-card to-card",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
    </motion.div>
  );
}
