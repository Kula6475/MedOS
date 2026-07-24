import { evidenceRef } from "@/lib/schemas"
import { buildLabAnalysisPrompt } from "@/lib/prompts"

import { runSpecialistAgent, type Agent, type AgentModelOutput } from "./agent"
import type { AgentContext } from "./agent-context"

const DISPLAY_NAME = "Lab Analysis Agent"
function buildModelOutput(context: AgentContext): AgentModelOutput {
  const { patient } = context
  const evidence: AgentModelOutput["evidence"] = []
  const possibleConcerns: string[] = []
  const missingInformation: string[] = [
    "Only a single collection batch is available in the supplied record; a trend cannot be established without repeat measurements.",
  ]

  const criticalLabs = patient.labs.filter((lab) => lab.critical)
  const abnormalLabs = patient.labs.filter((lab) => lab.abnormal && !lab.critical)

  patient.labs.forEach((lab, index) => {
    evidence.push({
      reference: evidenceRef("labs", index),
      description: `${lab.test}: ${lab.value}${lab.unit ? ` ${lab.unit}` : ""} (reference ${lab.referenceRange}, collected ${lab.collectedAt}).`,
      sourceSection: "labs",
    })

    if (lab.value.toLowerCase() === "pending") {
      missingInformation.push(`${lab.test} result is pending and not yet available for review.`)
    }
  })

  criticalLabs.forEach((lab) => {
    possibleConcerns.push(
      `${lab.test} (${lab.value}${lab.unit ? ` ${lab.unit}` : ""}) is a critical value outside reference range ${lab.referenceRange}.`,
    )
  })
  abnormalLabs.forEach((lab) => {
    possibleConcerns.push(
      `${lab.test} (${lab.value}${lab.unit ? ` ${lab.unit}` : ""}) is abnormal relative to reference range ${lab.referenceRange}.`,
    )
  })

  return {
    summary: `Reviewed ${patient.labs.length} laboratory result(s): ${criticalLabs.length} critical, ${abnormalLabs.length} abnormal (non-critical).`,
    recommendation:
      criticalLabs.length > 0
        ? "Prioritize clinician review of the critical laboratory values identified above."
        : abnormalLabs.length > 0
          ? "Route the abnormal laboratory values for clinician review alongside the clinical presentation."
          : "No abnormal laboratory values identified in the supplied results.",
    evidence,
    possibleConcerns,
    missingInformation,
  }
}

export const labAnalysisAgent: Agent = {
  name: "lab-analysis",
  displayName: DISPLAY_NAME,
  run: (context) => {
    const prompt = buildLabAnalysisPrompt(context.patient)
    return runSpecialistAgent({
      name: "lab-analysis",
      displayName: DISPLAY_NAME,
      context,
      promptVersion: prompt.version,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      buildModelOutput,
    })
  },
}
