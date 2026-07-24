import type { Metadata } from "next"

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { AppShell } from "@/components/navigation/app-shell"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Synthetic hospital operations and trustworthy AI analytics.",
}

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" eyebrow="Hospital Operations">
      <AnalyticsDashboard />
    </AppShell>
  )
}
