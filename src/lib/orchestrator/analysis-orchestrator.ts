import { randomUUID } from "node:crypto"

import { careCoordinationAgent, specialistAgents, type Agent, type AgentContext } from "@/lib/agents"
import { createModelProvider, createObservabilityProvider, type ModelProvider, type ObservabilityProvider } from "@/lib/providers"
import {
  agentResultSchema,
  patientRecordSchema,
  type AgentResult,
  type AgentStatus,
  type PatientAnalysis,
  type PatientRecord,
} from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { buildPatientAnalysis } from "./build-patient-analysis"

export type AnalysisOrchestratorErrorCode =
  | "invalid_request"
  | "patient_not_found"
  | "invalid_patient_record"
  | "coordination_failed"

export interface AnalysisOrchestratorError {
  code: AnalysisOrchestratorErrorCode
  message: string
}

export type AnalysisOrchestratorResult =
  | { ok: true; analysis: PatientAnalysis }
  | { ok: false; error: AnalysisOrchestratorError }

export interface RunAnalysisOptions {
  // Provide exactly one: a registered synthetic patient ID, or a full inline patient record.
  patientId?: string
  patient?: PatientRecord
  promptVersion?: string
  modelProvider?: ModelProvider
  observability?: ObservabilityProvider
}

// Second line of defense: every agent.run() already resolves to a valid AgentResult even on
// internal failure, but Promise.allSettled plus this fallback guards against an unexpected throw
// too, so one agent can never take down the whole analysis run.
function buildCrashFallbackResult(agent: Agent, reason: unknown): AgentResult {
  const safeReason = (reason instanceof Error ? reason.message : String(reason))
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [redacted]")
    .replace(/((?:api[-_ ]?key|authorization|token|secret)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .slice(0, 1_000)
  return agentResultSchema.parse({
    agent: agent.name,
    displayName: agent.displayName,
    status: "failed",
    summary: "The agent could not complete analysis.",
    recommendation: "Automated analysis unavailable; clinician review required.",
    evidence: [],
    possibleConcerns: [],
    missingInformation: [`${agent.displayName} analysis crashed unexpectedly and was excluded from this run.`],
    confidence: 0,
    latencyMs: 0,
    model: "unknown",
    provider: "mock",
    fallbackUsed: true,
    evaluationStatus: "not_evaluated",
    error: {
      code: "agent_crash",
      message: safeReason || "Agent crashed unexpectedly.",
      retryable: false,
    },
  } satisfies AgentResult)
}

// Validate patient -> create analysis ID -> run the four specialists concurrently via
// Promise.allSettled -> pass successful outputs into the Care Coordination Agent -> return
// PatientAnalysis. No Fireworks or Braintrust calls: providers default to the mock/local
// implementations from the provider-factory.
export async function runAnalysis(options: RunAnalysisOptions): Promise<AnalysisOrchestratorResult> {
  let rawPatient: PatientRecord | undefined
  let lookupLabel: string

  if (options.patient) {
    rawPatient = options.patient
    lookupLabel = options.patient.id
  } else if (options.patientId) {
    rawPatient = getPatientRecordById(options.patientId)
    lookupLabel = options.patientId
    if (!rawPatient) {
      return {
        ok: false,
        error: { code: "patient_not_found", message: `No synthetic patient record found for id "${options.patientId}".` },
      }
    }
  } else {
    return {
      ok: false,
      error: { code: "invalid_request", message: "Either patientId or patient must be provided." },
    }
  }

  const parsedPatient = patientRecordSchema.safeParse(rawPatient)
  if (!parsedPatient.success) {
    return {
      ok: false,
      error: {
        code: "invalid_patient_record",
        message: `Patient record "${lookupLabel}" failed schema validation: ${parsedPatient.error.message}`,
      },
    }
  }
  const patient = parsedPatient.data

  const analysisId = `analysis-${randomUUID()}`
  const startedAt = new Date().toISOString()
  const promptVersion = options.promptVersion ?? "medos-agents@2026-01"
  const modelProvider = options.modelProvider ?? createModelProvider()
  const observability = options.observability ?? createObservabilityProvider()

  const trace = observability.startAnalysisTrace({ analysisId, patientId: patient.id })
  let traceStatus: AgentStatus = "failed"
  try {
    observability.recordMetadata(trace, {
      analysisId,
      patientId: patient.id,
      workflowVersion: promptVersion,
      modelProviderMode: modelProvider.name,
      observabilityProviderMode: observability.name,
      specialistCount: specialistAgents.length,
    })
    const baseContext: AgentContext = { patient, modelProvider, observability, trace, promptVersion }

    const settled = await Promise.allSettled(specialistAgents.map((agent) => agent.run(baseContext)))

    const specialistResults: AgentResult[] = settled.map((outcome, index) =>
      outcome.status === "fulfilled" ? outcome.value : buildCrashFallbackResult(specialistAgents[index], outcome.reason),
    )

    let coordinationResult: AgentResult
    try {
      coordinationResult = await careCoordinationAgent.run({ ...baseContext, specialistResults })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      observability.recordError(trace, { code: "coordination_crash", message, retryable: false })
      return { ok: false, error: { code: "coordination_failed", message } }
    }

    const completedAt = new Date().toISOString()
    const analysis = buildPatientAnalysis({
      analysisId,
      patientId: patient.id,
      specialistResults,
      coordinationResult,
      trace,
      promptVersion,
      startedAt,
      completedAt,
    })

    traceStatus = coordinationResult.status
    observability.recordMetadata(trace, {
      workflowCompletionStatus: traceStatus,
      totalLatencyMs: analysis.totalLatencyMs,
      partialFailureCount: analysis.agents.filter((agent) => agent.status === "failed").length,
    })
    if (coordinationResult.evaluation) {
      observability.recordEvaluation(trace, coordinationResult.evaluation)
    }

    return { ok: true, analysis }
  } finally {
    await observability.endAnalysisTrace(trace, traceStatus)
  }
}
