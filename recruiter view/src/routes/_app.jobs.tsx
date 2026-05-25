import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Briefcase, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAts } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/jobs")({ component: JobsPage });

const tabs = ["Active", "Closed"] as const;

function JobsPage() {
  const jobs = useAts((s) => s.jobs);
  const fetchJobs = useAts((s) => s.fetchJobs);
  const openCreateJob = useAts((s) => s.openCreateJob);
  const openJob = useAts((s) => s.openJob);
  const closeJob = useAts((s) => s.closeJob);
  const reopenJob = useAts((s) => s.reopenJob);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const [tab, setTab] = useState<(typeof tabs)[number]>("Active");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("All");

  const [sortField, setSortField] = useState<string>("applicants");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs],
  );

  const filtered = jobs.filter(
    (j) =>
      j.status === tab &&
      (dept === "All" || j.department === dept) &&
      j.title.toLowerCase().includes(q.toLowerCase()),
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortField as keyof typeof a];
      let valB = b[sortField as keyof typeof b];
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ▴" : " ▾";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">Open vacancies and closed roles.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateJob}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Create job
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px]">
              {jobs.filter((j) => j.status === t).length}
            </span>
            {tab === t && (
              <motion.span layoutId="jobs-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs by title…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={dept} onChange={(e) => setDept(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        >
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm">
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/40 text-xs text-muted-foreground backdrop-blur">
            <tr>
              <th onClick={() => handleSort("title")} className="px-5 py-2.5 text-left font-medium cursor-pointer hover:bg-muted/60 select-none">
                Job{renderSortIcon("title")}
              </th>
              <th onClick={() => handleSort("department")} className="px-3 py-2.5 text-left font-medium cursor-pointer hover:bg-muted/60 select-none">
                Department{renderSortIcon("department")}
              </th>
              <th onClick={() => handleSort("applicants")} className="px-3 py-2.5 text-left font-medium cursor-pointer hover:bg-muted/60 select-none">
                Applicants{renderSortIcon("applicants")}
              </th>
              <th onClick={() => handleSort("postedDate")} className="px-3 py-2.5 text-left font-medium cursor-pointer hover:bg-muted/60 select-none">
                Posted{renderSortIcon("postedDate")}
              </th>
              <th className="px-3 py-2.5 text-right font-medium select-none">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-sm font-medium">No jobs here</div>
                  <div className="text-xs text-muted-foreground">Try a different tab or create a new job.</div>
                </td>
              </tr>
            )}
            {sorted.map((j) => (
              <tr
                key={j.id}
                onClick={() => openJob(j.id)}
                className="cursor-pointer border-t border-border transition hover:bg-muted/30"
              >
                <td className="px-5 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); openJob(j.id); }}
                    className="text-left font-medium hover:text-primary"
                  >
                    {j.title}
                  </button>
                  <div className="text-xs text-muted-foreground">{j.location} · {j.type}</div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{j.department}</td>
                <td className="px-3 py-3 tabular-nums">{j.applicants}</td>
                <td className="px-3 py-3 text-muted-foreground">{j.postedDate}</td>
                <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to="/candidates" search={{ jobId: j.id }}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      View candidates
                    </Link>
                    {isAdmin && (
                      j.status === "Active" ? (
                        <button
                          onClick={() => {
                            if (confirm(`Close vacancy "${j.title}"?`)) closeJob(j.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Lock className="h-3 w-3" /> Close
                        </button>
                      ) : (
                        <button
                          onClick={() => reopenJob(j.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                        >
                          <Unlock className="h-3 w-3" /> Reopen
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
