import { evidenceRef } from "@/lib/schemas"
import { buildMedicationSafetyPrompt } from "@/lib/prompts"

import { runSpecialistAgent, type Agent, type AgentModelOutput } from "./agent"
import type { AgentContext } from "./agent-context"

const DISPLAY_NAME = "Medication Safety Agent"
const RENAL_LAB_TERMS = ["creatinine", "gfr"]
const ORGAN_HISTORY_TERMS = ["kidney", "renal", "hepatic", "liver"]

function buildModelOutput(context: AgentContext): AgentModelOutput {
  const { patient } = context
  const evidence: AgentModelOutput["evidence"] = []
  const possibleConcerns: string[] = []
  const missingInformation: string[] = []

  const documentedAllergies = patient.allergies.filter(
    (allergy) => allergy.substance.toLowerCase() !== "no known drug allergies",
  )
  const severeAllergies = documentedAllergies.filter((allergy) => allergy.severity === "severe")

  documentedAllergies.forEach((allergy) => {
    evidence.push({
      reference: evidenceRef("allergies", patient.allergies.indexOf(allergy)),
      description: `${allergy.substance}: ${allergy.reaction} (${allergy.severity}).`,
      sourceSection: "allergies",
    })
  })
  if (severeAllergies.length > 0) {
    possibleConcerns.push(
      `Documented severe allerg${severeAllergies.length > 1 ? "ies" : "y"} (${severeAllergies
        .map((allergy) => allergy.substance)
        .join(", ")}); requires pharmacist or clinician review before any new medication order.`,
    )
  }
  if (documentedAllergies.length === 0) {
    missingInformation.push(
      'No documented drug allergies beyond "no known drug allergies"; confirm allergy history directly with patient or family if possible.',
    )
  }

  patient.medications.forEach((medication, index) => {
    evidence.push({
      reference: evidenceRef("medications", index),
      description: `${medication.name} ${medication.dose} ${medication.route}, ${medication.schedule} (${medication.status}).`,
      sourceSection: "medications",
    })
  })

  const relevantHistory = patient.history.filter((item) =>
    ORGAN_HISTORY_TERMS.some((term) => item.condition.toLowerCase().includes(term)),
  )
  relevantHistory.forEach((item) => {
    evidence.push({
      reference: evidenceRef("history", patient.history.indexOf(item)),
      description: item.condition,
      sourceSection: "history",
    })
  })

  const abnormalRenalLabs = patient.labs.filter(
    (lab) => lab.abnormal && RENAL_LAB_TERMS.some((term) => lab.test.toLowerCase().includes(term)),
  )
  if (abnormalRenalLabs.length > 0 && patient.medications.length > 0) {
    abnormalRenalLabs.forEach((lab) => {
      evidence.push({
        reference: evidenceRef("labs", patient.labs.indexOf(lab)),
        description: `${lab.test}: ${lab.value}${lab.unit ? ` ${lab.unit}` : ""} (reference ${lab.referenceRange}).`,
        sourceSection: "labs",
      })
    })
    possibleConcerns.push(
      "Abnormal renal function values are present; verify dosing of any renally cleared medications with pharmacy.",
    )
  } else if (relevantHistory.length > 0) {
    possibleConcerns.push(
      "Relevant organ-function history is documented; factor into medication dosing review even without a current abnormal lab value.",
    )
  }

  return {
    summary: `Medication safety review of ${patient.medications.length} active medication record(s) and ${documentedAllergies.length} documented allergy record(s).`,
    recommendation:
      possibleConcerns.length > 0
        ? "Route medication and allergy concerns to a pharmacist or clinician for review before administering or ordering new medications."
        : "No allergy or renal-dosing concerns identified from the supplied record; continue standard medication reconciliation.",
    evidence,
    possibleConcerns,
    missingInformation,
  }
}

export const medicationSafetyAgent: Agent = {
  name: "medication-safety",
  displayName: DISPLAY_NAME,
  run: (context) => {
    const prompt = buildMedicationSafetyPrompt(context.patient)
    return runSpecialistAgent({
      name: "medication-safety",
      displayName: DISPLAY_NAME,
      context,
      promptVersion: prompt.version,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      buildModelOutput,
    })
  },
}
