import { createFileRoute, redirect } from "@tanstack/react-router";

// Job detail is now consolidated into the Candidates page filtered by job.
export const Route = createFileRoute("/_app/jobs/$jobId")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/candidates", search: { jobId: params.jobId } });
  },
});
