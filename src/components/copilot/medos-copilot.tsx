"use client"

import { useMemo, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  CopilotKit,
  CopilotSidebar,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2"
import { KeyRound, Sparkles, X } from "lucide-react"
import { z } from "zod"

import {
  departmentMetrics,
  emergencyAlerts,
  syntheticPatients,
} from "@/lib/mock-hospital-data"
import { getPatientDetail } from "@/lib/mock-patient-details"
import { Button } from "@/components/ui/button"

const MEDOS_ROUTES = {
  dashboard: "/dashboard",
  patients: "/patients",
  agents: "/agents",
  analytics: "/analytics",
  trust: "/trust",
  settings: "/settings",
} as const

type MedOSCopilotProviderProps = {
  children: ReactNode
  configured: boolean
}

export function MedOSCopilotProvider({
  children,
  configured,
}: MedOSCopilotProviderProps) {
  if (!configured) {
    return (
      <>
        {children}
        <CopilotSetupNotice />
      </>
    )
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint
      credentials="include"
    >
      <MedOSCopilotExperience>{children}</MedOSCopilotExperience>
    </CopilotKit>
  )
}

function MedOSCopilotExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const patientId = pathname.match(/^\/patients\/([^/]+)$/)?.[1]?.toUpperCase()
  const patientDetail = patientId ? getPatientDetail(patientId) : undefined

  const routeContext = useMemo(
    () => ({
      currentPath: pathname,
      section:
        Object.entries(MEDOS_ROUTES).find(([, path]) =>
          pathname.startsWith(path),
        )?.[0] ?? "landing",
      syntheticDemo: true,
    }),
    [pathname],
  )

  const patientContext = useMemo(() => {
    if (!patientDetail) {
      return {
        selectedPatient: null,
        note: "No synthetic patient workspace is currently selected.",
      }
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
    description:
      "The selected synthetic patient workspace and its visible clinical summary",
    value: JSON.stringify(patientContext),
  })

  useAgentContext({
    description: "Current synthetic emergency-department snapshot",
    value: JSON.stringify({
      metrics: departmentMetrics,
      alerts: emergencyAlerts,
    }),
  })

  useFrontendTool(
    {
      name: "openPatientWorkspace",
      description:
        "Open a synthetic patient's MedOS workspace after confirming that the patient ID exists.",
      parameters: z.object({
        patientId: z
          .string()
          .describe("Synthetic MedOS patient ID, for example MED-1042"),
      }),
      handler: async ({ patientId: requestedId }) => {
        const normalizedId = requestedId.trim().toUpperCase()
        const exists = syntheticPatients.some(
          (patient) => patient.id === normalizedId,
        )

        if (!exists) {
          return {
            success: false,
            message: `Patient ${normalizedId} was not found in the synthetic demo.`,
            availablePatientIds: syntheticPatients.map((patient) => patient.id),
          }
        }

        router.push(`/patients/${normalizedId}`)
        return {
          success: true,
          message: `Opened the synthetic workspace for ${normalizedId}.`,
        }
      },
    },
    [router],
  )

  useFrontendTool(
    {
      name: "navigateMedOS",
      description:
        "Navigate to a main MedOS section: dashboard, patients, agents, analytics, trust, or settings.",
      parameters: z.object({
        section: z.enum([
          "dashboard",
          "patients",
          "agents",
          "analytics",
          "trust",
          "settings",
        ]),
      }),
      handler: async ({ section }) => {
        router.push(MEDOS_ROUTES[section])
        return {
          success: true,
          message: `Opened the MedOS ${section} section.`,
        }
      },
    },
    [router],
  )

  useConfigureSuggestions(
    {
      available: "before-first-message",
      suggestions: patientDetail
        ? [
            {
              title: "Summarize this record",
              message: `Summarize the synthetic record for ${patientDetail.patient.id}, highlighting alerts and pending items.`,
            },
            {
              title: "Review record evidence",
              message: `What facts in the synthetic ${patientDetail.patient.id} record support its current recommendations?`,
            },
            {
              title: "Open the dashboard",
              message: "Take me to the operations dashboard.",
            },
          ]
        : [
            {
              title: "Department status",
              message:
                "Summarize the synthetic department status and its most urgent alerts.",
            },
            {
              title: "High-acuity queue",
              message:
                "Show me the high-acuity synthetic patients and explain which alerts are displayed.",
            },
            {
              title: "How MedOS works",
              message:
                "Explain the main MedOS sections and how I should navigate this demo.",
            },
          ],
    },
    [patientDetail?.patient.id],
  )

  if (pathname === "/") {
    return children
  }

  return (
    <>
      {children}
      <CopilotSidebar
        agentId="default"
        defaultOpen={false}
        width="min(420px, 100vw)"
        labels={{
          modalHeaderTitle: "MedOS Copilot",
          chatInputPlaceholder: "Ask about this synthetic workspace…",
          welcomeMessageText:
            "Ask about the synthetic patient record, department status, or how MedOS works.",
          chatDisclaimerText:
            "Synthetic demo only — not medical advice. Human review is required.",
          chatToggleOpenLabel: "Open MedOS Copilot",
          chatToggleCloseLabel: "Close MedOS Copilot",
        }}
      />
    </>
  )
}

function CopilotSetupNotice() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === "/") {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-popover p-4 text-popover-foreground shadow-float">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <KeyRound className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">CopilotKit is installed</p>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Close Copilot setup"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Add <code className="font-mono text-foreground">FIREWORKS_API_KEY</code>{" "}
                to this deployment, then redeploy to activate the
                context-aware MedOS Copilot.
              </p>
              <p className="mt-2 text-[0.6875rem] leading-4 text-muted-foreground">
                The integration is read-only and uses synthetic demo data.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        size="lg"
        className="rounded-full shadow-float"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <Sparkles />
        Copilot setup
      </Button>
    </div>
  )
}
