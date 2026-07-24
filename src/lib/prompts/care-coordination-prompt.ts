import type { AgentEvidence, AgentResult } from "@/lib/schemas"

import { syntheticDataBlock, type AgentPrompt } from "./prompt-utils"

function dedupeEvidence(results: AgentResult[]): AgentEvidence[] {
  const evidenceByReference = new Map<string, AgentEvidence>()
  for (const result of results) {
    for (const evidence of result.evidence) {
      if (!evidenceByReference.has(evidence.reference)) evidenceByReference.set(evidence.reference, evidence)
    }
  }
  return [...evidenceByReference.values()]
}

export function buildCareCoordinationPrompt(patientId: string, specialistResults: AgentResult[]): AgentPrompt {
  const usable = specialistResults.filter((result) => result.status === "passed" || result.status === "review")
  const unavailable = specialistResults.filter((result) => result.status === "blocked" || result.status === "failed")

  return {
    version: "care-coordination-agent@2026-03",
    systemPrompt: [
      "You coordinate MedOS specialist results into concise synthetic clinical decision support, not a diagnosis or medical advice.",
      "Use only supplied usable results and evidence references; never invent facts or autonomous orders.",
      "Return JSON matching the schema. Keep each summary, action, rationale, and risk to one sentence; avoid repetition.",
      "Include urgent, next, or monitor priorities with a responsible role and evidence references. Set humanReviewRequired to true.",
    ].join(" "),
    userPrompt: syntheticDataBlock("evaluated_specialist_outputs", {
      patientId,
      specialists: usable.map((result) => ({
        agent: result.agent,
        summary: result.summary,
        recommendation: result.recommendation,
        evidenceRefs: result.evidence.map((evidence) => evidence.reference),
        concerns: result.possibleConcerns,
        missing: result.missingInformation,
      })),
      evidence: dedupeEvidence(usable),
      unavailable: unavailable.map((result) => ({ agent: result.agent, status: result.status })),
    }),
  }
}
