import type { Metadata } from "next"

import { OperationsDashboard } from "@/components/dashboard/operations-dashboard"
import { AppShell } from "@/components/navigation/app-shell"

export const metadata: Metadata = {
  title: "Hospital Operations",
  description: "Synthetic emergency department operations command center.",
}

export default function DashboardPage() {
  return (
    <AppShell title="Hospital Operations" eyebrow="Command Center">
      <OperationsDashboard />
    </AppShell>
  )
}
