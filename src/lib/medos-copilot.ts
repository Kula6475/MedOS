import {
  departmentMetrics,
  emergencyAlerts,
  hospitalUtilization,
  syntheticPatients,
} from "@/lib/mock-hospital-data"
import { getPatientDetail } from "@/lib/mock-patient-details"
import { defineTool } from "@copilotkit/runtime/v2"
import { z } from "zod"

export const MEDOS_COPILOT_PROMPT = `You are MedOS Copilot, a read-only assistant embedded in a synthetic emergency-department operations demo.

Safety and scope:
- Every patient, alert, metric, note, and recommendation in MedOS is synthetic demonstration data.
- Never present MedOS data as a real patient record, real-time hospital state, or completed real-world clinical analysis.
- Do not diagnose, prescribe, order treatment, or replace licensed clinical judgment.
- You may summarize the displayed synthetic record, compare dashboard values, explain MedOS features, and help users navigate.
- Clearly separate facts present in context/tool results from missing information or inference.
- When discussing a clinical recommendation already present in the synthetic record, attribute it to the record and remind the user that human review is required.
- Prefer short, structured answers. Mention the relevant synthetic patient ID when discussing a patient.
- Use the available tools instead of inventing patient or department data.

You can use browser navigation tools to open MedOS pages. Do not claim navigation succeeded until the tool confirms it.`

const getPatientRecord = defineTool({
  name: "getPatientRecord",
  description:
    "Return the complete synthetic MedOS record for a patient ID. Use this before answering detailed patient questions.",
  parameters: z.object({
    patientId: z
      .string()
      .describe("Synthetic MedOS patient ID, for example MED-1042"),
  }),
  execute: async ({ patientId }) => {
    const normalizedId = patientId.trim().toUpperCase()
    const detail = getPatientDetail(normalizedId)

    if (!detail) {
      return {
        found: false,
        patientId: normalizedId,
        availablePatientIds: syntheticPatients.map((patient) => patient.id),
      }
    }

    return {
      found: true,
      syntheticDemo: true,
      humanReviewRequired: true,
      ...detail,
    }
  },
})

const listHighAcuityPatients = defineTool({
  name: "listHighAcuityPatients",
  description:
    "List synthetic MedOS patients with ESI 1 or ESI 2 acuity, including their current status and alerts.",
  parameters: z.object({}),
  execute: async () => ({
    syntheticDemo: true,
    patients: syntheticPatients.filter(
      (patient) => patient.acuity === "ESI 1" || patient.acuity === "ESI 2",
    ),
  }),
})

const getDepartmentSnapshot = defineTool({
  name: "getDepartmentSnapshot",
  description:
    "Return the current synthetic MedOS emergency-department metrics, alerts, and hospital utilization snapshot.",
  parameters: z.object({}),
  execute: async () => ({
    syntheticDemo: true,
    metrics: departmentMetrics,
    alerts: emergencyAlerts,
    utilization: hospitalUtilization,
  }),
})

export const medosCopilotTools = [
  getPatientRecord,
  listHighAcuityPatients,
  getDepartmentSnapshot,
]
