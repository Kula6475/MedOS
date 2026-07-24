import type { Metadata } from "next"
import { Suspense } from "react"

import { AppShell } from "@/components/navigation/app-shell"
import { TableSkeleton } from "@/components/feedback/loading-skeletons"
import { PatientsPage } from "@/components/patients/patients-page"

export const metadata: Metadata = {
  title: "Patients",
  description: "Full synthetic emergency department patient queue.",
}

export default function PatientsRoute() {
  return (
    <AppShell title="Patients" eyebrow="Emergency Department" contentClassName="max-w-[1600px]">
      <Suspense fallback={<div className="mx-auto max-w-[1600px] space-y-4 pb-8"><TableSkeleton rows={6} /></div>}>
        <PatientsPage />
      </Suspense>
    </AppShell>
  )
}
