"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  CopilotKit,
  CopilotSidebar,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2"
import { z } from "zod"

import { departmentMetrics, emergencyAlerts, syntheticPatients } from "@/lib/mock-hospital-data"
import { getPatientDetail } from "@/lib/mock-patient-details"

const MEDOS_ROUTES = {
  dashboard: "/dashboard",
  patients: "/patients",
  agents: "/agents",
  analytics: "/analytics",
  trust: "/trust",
  settings: "/settings",
} as const

function MedOSCopilotTools() {
  const pathname = usePathname()
  const router = useRouter()
  const patientId = pathname.match(/^\/patients\/([^/]+)$/)?.[1]?.toUpperCase()
  const patientDetail = patientId ? getPatientDetail(patientId) : undefined

  const routeContext = useMemo(
    () => ({
      currentPath: pathname,
      section: Object.entries(MEDOS_ROUTES).find(([, path]) => pathname.startsWith(path))?.[0] ?? "landing",
      syntheticDemo: true,
    }),
    [pathname],
  )

  const patientContext = useMemo(() => {
    if (!patientDetail) {
      return { selectedPatient: null, note: "No synthetic patient workspace is currently selected." }
    }
    return {
      selectedPatient: patientDetail.patient,
      allergies: patientDetail.allergies,
      vitals: patientDetail.vitals,
      labs: patientDetail.labs,
      recommendations: patientDetail.recommendations,
      note: "This is synthetic demo data. Human review is required.",
    }
  }, [patientDetail])

  useAgentContext({
    description: "The MedOS page the user is currently viewing",
    value: JSON.stringify(routeContext),
  })
  useAgentContext({
    description: "The selected synthetic patient workspace and its visible clinical summary",
    value: JSON.stringify(patientContext),
  })
  useAgentContext({
    description: "Current synthetic emergency-department snapshot",
    value: JSON.stringify({ metrics: departmentMetrics, alerts: emergencyAlerts }),
  })

  useFrontendTool(
    {
      name: "openPatientWorkspace",
      description: "Open a synthetic patient's MedOS workspace after confirming that the patient ID exists.",
      parameters: z.object({ patientId: z.string().describe("Synthetic MedOS patient ID, for example MED-1042") }),
      handler: async ({ patientId: requestedId }) => {
        const normalizedId = requestedId.trim().toUpperCase()
        const exists = syntheticPatients.some((patient) => patient.id === normalizedId)
        if (!exists) {
          return {
            success: false,
            message: `Patient ${normalizedId} was not found in the synthetic demo.`,
            availablePatientIds: syntheticPatients.map((patient) => patient.id),
          }
        }
        router.push(`/patients/${normalizedId}`)
        return { success: true, message: `Opened the synthetic workspace for ${normalizedId}.` }
      },
    },
    [router],
  )

  useFrontendTool(
    {
      name: "navigateMedOS",
      description: "Navigate to a main MedOS section: dashboard, patients, agents, analytics, trust, or settings.",
      parameters: z.object({ section: z.enum(["dashboard", "patients", "agents", "analytics", "trust", "settings"]) }),
      handler: async ({ section }) => {
        router.push(MEDOS_ROUTES[section])
        return { success: true, message: `Opened the MedOS ${section} section.` }
      },
    },
    [router],
  )

  useConfigureSuggestions(
    {
      available: "before-first-message",
      suggestions: patientDetail
        ? [
            { title: "Summarize this record", message: `Summarize the synthetic record for ${patientDetail.patient.id}, highlighting alerts and pending items.` },
            { title: "Review record evidence", message: `What facts in the synthetic ${patientDetail.patient.id} record support its current recommendations?` },
            { title: "Open the dashboard", message: "Take me to the operations dashboard." },
          ]
        : [
            { title: "Department status", message: "Summarize the synthetic department status and its most urgent alerts." },
            { title: "High-acuity queue", message: "Show me the high-acuity synthetic patients and explain which alerts are displayed." },
            { title: "How MedOS works", message: "Explain the main MedOS sections and how I should navigate this demo." },
          ],
    },
    [patientDetail?.patient.id],
  )

  if (pathname === "/") return null

  return (
    <CopilotSidebar
      agentId="default"
      defaultOpen={false}
      width="min(420px, 100vw)"
      labels={{
        modalHeaderTitle: "MedOS Copilot",
        chatInputPlaceholder: "Ask about this synthetic workspace…",
        welcomeMessageText: "Ask about the synthetic patient record, department status, or how MedOS works.",
        chatDisclaimerText: "Synthetic demo only — not medical advice. Human review is required.",
        chatToggleOpenLabel: "Open MedOS Copilot",
        chatToggleCloseLabel: "Close MedOS Copilot",
      }}
    />
  )
}

export function MedOSCopilotExperience() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint credentials="include">
      <MedOSCopilotTools />
    </CopilotKit>
  )
}
