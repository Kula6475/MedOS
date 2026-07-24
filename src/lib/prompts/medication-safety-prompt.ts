import { evidenceRef, type PatientRecord } from "@/lib/schemas"

import { SHARED_SAFETY_RULES, syntheticDataBlock, type AgentPrompt } from "./prompt-utils"

const RELEVANT_HISTORY = /kidney|renal|hepatic|liver|bleed|cardiac|heart/i
const RELEVANT_LAB = /creatinine|gfr|inr|potassium|ast|alt|bilirubin/i

export function buildMedicationSafetyPrompt(patient: PatientRecord): AgentPrompt {
  return {
    version: "medication-safety-agent@2026-02",
    systemPrompt: [
      "You are the Medication Safety Agent for MedOS.",
      SHARED_SAFETY_RULES,
      "Identify potential allergy, interaction, contraindication, or dosing-review concerns. Phrase actions as pharmacist or clinician review requirements. Omit coordinatedPlan from your response.",
    ].join(" "),
    userPrompt: syntheticDataBlock("synthetic_medication_record", {
      patientId: patient.id,
      medications: patient.medications.map((value, index) => ({
        reference: evidenceRef("medications", index),
        ...value,
      })),
      allergies: patient.allergies.map((value, index) => ({ reference: evidenceRef("allergies", index), ...value })),
      relevantHistory: patient.history.flatMap((value, index) =>
        RELEVANT_HISTORY.test(value.condition) ? [{ reference: evidenceRef("history", index), ...value }] : [],
      ),
      relevantLabs: patient.labs.flatMap((value, index) =>
        RELEVANT_LAB.test(value.test) ? [{ reference: evidenceRef("labs", index), ...value }] : [],
      ),
    }),
  }
}
