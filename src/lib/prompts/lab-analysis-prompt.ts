import { evidenceRef, type PatientRecord } from "@/lib/schemas"

import { SHARED_SAFETY_RULES, syntheticDataBlock, type AgentPrompt } from "./prompt-utils"

export function buildLabAnalysisPrompt(patient: PatientRecord): AgentPrompt {
  return {
    version: "lab-analysis-agent@2026-02",
    systemPrompt: [
      "You are the Lab Analysis Agent for MedOS.",
      SHARED_SAFETY_RULES,
      "Summarize supplied abnormal and critical values, timestamps, missing results, and limitations. Suggest repeat or missing information only for clinician consideration. Omit coordinatedPlan from your response.",
    ].join(" "),
    userPrompt: syntheticDataBlock("synthetic_lab_record", {
      patientId: patient.id,
      labs: patient.labs.map((value, index) => ({ reference: evidenceRef("labs", index), ...value })),
    }),
  }
}
