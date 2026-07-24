import { AppShellSkeleton } from "@/components/feedback/loading-skeletons"

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading MedOS workspace">
      <AppShellSkeleton />
      <span className="sr-only">Loading MedOS workspace…</span>
    </div>
  )
}
