import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PatientWorkspace } from "@/components/patient/patient-workspace"
import { AppShell } from "@/components/navigation/app-shell"
import { getPatientDetail, patientDetails } from "@/lib/mock-patient-details"

type PatientPageProps = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return Object.keys(patientDetails).map((id) => ({ id }))
}

export async function generateMetadata({ params }: PatientPageProps): Promise<Metadata> {
  const { id } = await params
  const detail = getPatientDetail(id)
  return { title: detail ? `${detail.patient.name} · Patient Workspace` : "Patient not found" }
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params
  const detail = getPatientDetail(id)
  if (!detail) notFound()

  return (
    <AppShell
      title={detail.patient.name}
      breadcrumbs={[
        { label: "Command Center", href: "/dashboard" },
        { label: "Patients", href: "/patients" },
        { label: `${detail.patient.id} · Workspace` },
      ]}
    >
      <PatientWorkspace detail={detail} />
    </AppShell>
  )
}
