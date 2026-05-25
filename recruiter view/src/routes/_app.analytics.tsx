import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend, LabelList
} from "recharts";
import { useAts } from "@/lib/store";
import type { CandidateStage } from "@/lib/data";

export const Route = createFileRoute("/_app/analytics")({ component: AnalyticsPage });

const TOOLTIP = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 8, fontSize: 12,
  },
};

const COLORS = [
  "oklch(0.57 0.23 22)", "oklch(0.65 0.18 27)", "oklch(0.7 0.16 200)",
  "oklch(0.75 0.16 80)", "oklch(0.65 0.18 22)",
];

function AnalyticsPage() {
  const jobs = useAts((s) => s.jobs);
  const candidates = useAts((s) => s.candidates);
  const fetchJobs = useAts((s) => s.fetchJobs);
  const fetchCandidates = useAts((s) => s.fetchCandidates);

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [fetchJobs, fetchCandidates]);



  const matchDistribution = useMemo(() => {
    const buckets = [
      { bucket: "0-40", min: 0, max: 40 },
      { bucket: "40-60", min: 40, max: 60 },
      { bucket: "60-75", min: 60, max: 75 },
      { bucket: "75-88", min: 75, max: 88 },
      { bucket: "88-100", min: 88, max: 101 },
    ];
    return buckets.map(b => ({
      bucket: b.bucket,
      count: candidates.filter(c => c.match >= b.min && c.match < b.max).length
    }));
  }, [candidates]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Pipeline performance and recruiter activity.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">



        <Card title="Match score distribution">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={matchDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="md" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.57 0.23 22)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.57 0.23 22)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="bucket" fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP} />
              <Area type="monotone" dataKey="count" stroke="oklch(0.57 0.23 22)" strokeWidth={2} fill="url(#md)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Hiring velocity">
          <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
            Data will populate as candidates progress through stages
          </div>
        </Card>

        <Card title="Team overview" className="lg:col-span-2">
          <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
            Recruiter activity data coming soon
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}
