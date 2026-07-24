import type { AnalysisTraceHandle } from "@/lib/providers"
import {
  MEDOS_DISCLAIMER,
  braintrustMetadataSchema,
  fireworksMetadataSchema,
  overallRiskSchema,
  patientAnalysisSchema,
  type AgentResult,
  type OverallRisk,
  type PatientAnalysis,
} from "@/lib/schemas"

const IMMEDIATE_PRIORITY_PATTERN = /critical|shock|hypoxemia|anaphylaxis|hemorrhage/i
const SAFETY_WARNING_PATTERN = /allerg|contraindicat|pharmacist|interaction/i

function deriveOverallRisk(specialistResults: AgentResult[]): OverallRisk {
  const usableResults = specialistResults.filter((result) => result.status === "passed" || result.status === "review")
  const totalConcerns = usableResults.reduce((sum, result) => sum + result.possibleConcerns.length, 0)
  const hasCriticalSignal = usableResults.some((result) =>
    result.possibleConcerns.some((concern) => IMMEDIATE_PRIORITY_PATTERN.test(concern)),
  )
  if (hasCriticalSignal) return "critical"
  if (totalConcerns >= 3) return "high"
  if (totalConcerns >= 1) return "moderate"
  return "low"
}

// Assembles the final PatientAnalysis from already-validated agent results only — no new clinical
// facts are introduced here, just aggregation, filtering, and the required metadata/disclaimer.
export function buildPatientAnalysis(params: {
  analysisId: string
  patientId: string
  specialistResults: AgentResult[]
  coordinationResult: AgentResult
  trace: AnalysisTraceHandle
  promptVersion: string
  startedAt: string
  completedAt: string
}): PatientAnalysis {
  const { analysisId, patientId, specialistResults, coordinationResult, trace, promptVersion, startedAt, completedAt } =
    params

  // Specialists execute concurrently, so the critical-path latency is the slowest specialist plus
  // the coordinator, not the sum of all five calls.
  const totalLatencyMs = Math.max(0, ...specialistResults.map((result) => result.latencyMs)) + coordinationResult.latencyMs
  const coordinatorPassedGate = coordinationResult.status === "passed" || coordinationResult.status === "review"

  const immediateActions = coordinatorPassedGate
    ? coordinationResult.possibleConcerns.filter((concern) => IMMEDIATE_PRIORITY_PATTERN.test(concern))
    : []
  const safetyWarnings = coordinatorPassedGate
    ? coordinationResult.possibleConcerns.filter((concern) => SAFETY_WARNING_PATTERN.test(concern))
    : ["The coordinated recommendation was blocked or unavailable. Use clinician review of the source record."]

  return patientAnalysisSchema.parse({
    analysisId,
    patientId,
    overallRisk: overallRiskSchema.parse(deriveOverallRisk(specialistResults)),
    agents: [...specialistResults, coordinationResult],
    finalRecommendation: coordinatorPassedGate
      ? coordinationResult.recommendation
      : "Automated care coordination did not pass the deterministic safety gate. No automated recommendation is available; clinician review of the synthetic source record is required.",
    coordinatedPlan: coordinatorPassedGate ? coordinationResult.coordinatedPlan : undefined,
    immediateActions,
    safetyWarnings,
    missingInformation: coordinationResult.missingInformation,
    fireworksMetadata: fireworksMetadataSchema.parse({
      primaryModel: coordinationResult.model,
      promptVersion,
    }),
    braintrustMetadata: braintrustMetadataSchema.parse({
      projectName: trace.projectName ?? "medos-local",
      traceId: trace.traceId,
      traceUrl: trace.traceUrl,
      evaluation: coordinationResult.evaluation,
      onlineScoringEnabled: false,
    }),
    startedAt,
    completedAt,
    totalLatencyMs,
    disclaimer: MEDOS_DISCLAIMER,
  } satisfies PatientAnalysis)
}
