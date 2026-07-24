import type { Metadata } from "next"

import { AgentsOverview } from "@/components/agents/agents-overview"
import { AppShell } from "@/components/navigation/app-shell"

export const metadata: Metadata = {
  title: "Agents",
  description: "Specialized AI agent coverage, safety checks, and simulated performance.",
}

export default function AgentsPage() {
  return (
    <AppShell title="Agents" eyebrow="AI Care Team">
      <AgentsOverview />
    </AppShell>
  )
}
