import { z } from "zod"

// Deterministic evidence-reference convention: "<section>.<index>" (or just "<section>" for
// singular facts like demographics). Fixture arrays never get reordered, so these paths stay
// stable across runs and can be safely cited by AgentEvidence.reference.
//
// This is the single source of truth for valid sections — agentEvidenceSchema.sourceSection
// reuses it directly so the two can never drift apart again.
export const patientRecordSectionSchema = z.enum([
  "demographics",
  "history",
  "symptoms",
  "vitals",
  "medications",
  "allergies",
  "labs",
  "imaging",
  "notes",
  "timeline",
])
export type PatientRecordSection = z.infer<typeof patientRecordSectionSchema>

export function evidenceRef(section: PatientRecordSection, index?: number): string {
  return typeof index === "number" ? `${section}.${index}` : section
}
