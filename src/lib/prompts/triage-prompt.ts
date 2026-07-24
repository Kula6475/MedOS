import { evidenceRef, type PatientRecord } from "@/lib/schemas"

import { SHARED_SAFETY_RULES, syntheticDataBlock, type AgentPrompt } from "./prompt-utils"

export function buildTriagePrompt(patient: PatientRecord): AgentPrompt {
  return {
    version: "triage-agent@2026-02",
    systemPrompt: [
      "You are the Triage Agent for MedOS.",
      SHARED_SAFETY_RULES,
      "Assess urgency from the supplied chief complaint, symptoms, history, arrival time, and vital signs. Cite only supplied references. Omit coordinatedPlan from your response.",
    ].join(" "),
    userPrompt: syntheticDataBlock("synthetic_triage_record", {
      patientId: patient.id,
      arrivalAt: patient.arrivalAt,
      chiefComplaint: { reference: "chiefComplaint", value: patient.chiefComplaint },
      history: patient.history.map((value, index) => ({ reference: evidenceRef("history", index), ...value })),
      symptoms: patient.symptoms.map((value, index) => ({ reference: evidenceRef("symptoms", index), ...value })),
      vitals: patient.vitals.map((value, index) => ({ reference: evidenceRef("vitals", index), ...value })),
    }),
  }
}
