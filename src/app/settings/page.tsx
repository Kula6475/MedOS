import type { Metadata } from "next"

import { AppShell } from "@/components/navigation/app-shell"
import { SettingsPage } from "@/components/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings",
  description: "MedOS workspace preferences and mock integration configuration.",
}

export default function SettingsRoute() {
  return <AppShell title="Settings" eyebrow="Workspace"><SettingsPage /></AppShell>
}
