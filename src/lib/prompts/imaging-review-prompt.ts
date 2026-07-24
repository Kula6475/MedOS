import { evidenceRef, type PatientRecord } from "@/lib/schemas"

import { SHARED_SAFETY_RULES, syntheticDataBlock, type AgentPrompt } from "./prompt-utils"

export function buildImagingReviewPrompt(patient: PatientRecord): AgentPrompt {
  return {
    version: "imaging-review-agent@2026-02",
    systemPrompt: [
      "You are the Imaging Review Agent for MedOS.",
      SHARED_SAFETY_RULES,
      "Review written report text only. Never claim to inspect raw images. Distinguish reported findings, pending interpretations, negative findings, and limitations. Omit coordinatedPlan from your response.",
    ].join(" "),
    userPrompt: syntheticDataBlock("synthetic_imaging_reports", {
      patientId: patient.id,
      imagingReports: patient.imaging.map((value, index) => ({ reference: evidenceRef("imaging", index), ...value })),
    }),
  }
}
