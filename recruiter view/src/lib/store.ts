import { create } from "zustand";
import { api } from "@/lib/api";
import type { Candidate, Job, CandidateStage } from "@/lib/data";

type NewJobInput = {
  title: string;
  department: string;
  location: string;
  type: Job["type"];
  description: string;
  skills: string[];
};

type AtsState = {
  jobs: Job[];
  candidates: Candidate[];
  loading: boolean;
  selectedCandidateId: string | null;
  selectedJobId: string | null;
  createJobOpen: boolean;

  fetchJobs: () => Promise<void>;
  fetchCandidates: () => Promise<void>;
  openCandidate: (id: string) => void;
  closeCandidate: () => void;
  openJob: (id: string) => void;
  closeJobModal: () => void;
  openCreateJob: () => void;
  closeCreateJob: () => void;
  createJob: (j: NewJobInput) => Promise<string>;
  closeJob: (id: string) => void;
  reopenJob: (id: string) => void;
  updateCandidateStage: (id: string, stage: CandidateStage) => Promise<void>;
  addCandidateNote: (id: string, content: string) => Promise<void>;
};

let jobsPromise: Promise<void> | null = null;
let candidatesPromise: Promise<void> | null = null;

export const useAts = create<AtsState>((set, get) => ({
  jobs: [],
  candidates: [],
  loading: true,
  selectedCandidateId: null,
  selectedJobId: null,
  createJobOpen: false,

  fetchJobs: async () => {
    if (jobsPromise) return jobsPromise;
    jobsPromise = (async () => {
      try {
        const jobs = await api.getJobs();
        set({ jobs });
      } catch (e) {
        console.error("Failed to fetch jobs", e);
      } finally {
        jobsPromise = null;
      }
    })();
    return jobsPromise;
  },

  fetchCandidates: async () => {
    if (candidatesPromise) return candidatesPromise;
    candidatesPromise = (async () => {
      try {
        const data = await api.getCandidates({ page: 1, size: 1000 });
        set({ candidates: data.items, loading: false });
      } catch (e) {
        console.error("Failed to fetch candidates", e);
        set({ loading: false });
      } finally {
        candidatesPromise = null;
      }
    })();
    return candidatesPromise;
  },

  openCandidate: (id) => set({ selectedCandidateId: id }),
  closeCandidate: () => set({ selectedCandidateId: null }),
  openJob: (id) => set({ selectedJobId: id }),
  closeJobModal: () => set({ selectedJobId: null }),
  openCreateJob: () => set({ createJobOpen: true }),
  closeCreateJob: () => set({ createJobOpen: false }),

  createJob: async (j) => {
    try {
      const job = await api.createJob(j);
      set((s) => ({ jobs: [job, ...s.jobs], createJobOpen: false }));
      return job.id;
    } catch (e: any) {
      alert(e.message || "Failed to create job");
      return "";
    }
  },

  closeJob: async (id) => {
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: "Closed" } : j)),
    }));
    try {
      await api.updateJobStatus(id, "Closed");
    } catch (e) {
      console.error("Failed to close job on server", e);
      const jobs = await api.getJobs();
      set({ jobs });
    }
  },
  reopenJob: async (id) => {
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: "Active" } : j)),
    }));
    try {
      await api.updateJobStatus(id, "Active");
    } catch (e) {
      console.error("Failed to reopen job on server", e);
      const jobs = await api.getJobs();
      set({ jobs });
    }
  },
  updateCandidateStage: async (id, stage) => {
    // Optimistic update
    set((s) => ({
      candidates: s.candidates.map((c) => (c.id === id ? { ...c, stage } : c)),
    }));
    try {
      await api.updateCandidateStage(id, stage);
    } catch (e) {
      console.error("Failed to update candidate stage on server", e);
      // Revert/refresh candidates from server
      const data = await api.getCandidates({ page: 1, size: 1000 });
      set({ candidates: data.items });
    }
  },
  addCandidateNote: async (id, content) => {
    // Optimistic update
    const tempAuthor = "You"; // Or get from auth if needed locally
    const tempDate = new Date().toISOString().slice(0, 10);
    
    set((s) => ({
      candidates: s.candidates.map((c) =>
        c.id === id
          ? {
               ...c,
               notes: [
                 { author: tempAuthor, date: tempDate, content },
                 ...(c.notes || []),
               ],
             }
          : c,
      ),
    }));

    try {
      const updatedCandidate = await api.addCandidateNote(id, content);
      set((s) => ({
        candidates: s.candidates.map((c) =>
          c.id === id ? updatedCandidate : c
        ),
      }));
    } catch (e) {
      console.error("Failed to add candidate note on server", e);
      // Revert/refresh candidates from server
      const data = await api.getCandidates({ page: 1, size: 1000 });
      set({ candidates: data.items });
    }
  },
}));
