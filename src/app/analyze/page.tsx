import type { Metadata } from "next"

import { NewAnalysisWorkspace } from "@/components/analyze/new-analysis-workspace"
import { AppShell } from "@/components/navigation/app-shell"

export const metadata: Metadata = { title: "New Analysis · MedOS" }

export default function AnalyzePage() {
  return (
    <AppShell
      title="New Analysis"
      breadcrumbs={[
        { label: "Command Center", href: "/dashboard" },
        { label: "New Analysis" },
      ]}
    >
      <NewAnalysisWorkspace />
    </AppShell>
  )
}
