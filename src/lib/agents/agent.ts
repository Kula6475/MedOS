import { z } from "zod"

import { evaluateAgentResult } from "@/lib/evaluators"
import {
  agentEvidenceSchema,
  agentResultSchema,
  coordinatedPlanSchema,
  type AgentError,
  type AgentName,
  type AgentResult,
  type AgentStatus,
} from "@/lib/schemas"

import type { AgentContext, CoordinationAgentContext } from "./agent-context"

// What a model call (real or mock) is expected to produce, before it's wrapped with provider
// metadata (model, latency, provider, fallbackUsed) into a full AgentResult.
const baseAgentModelOutputShape = {
  summary: z.string().trim().min(1).max(8_000),
  recommendation: z.string().trim().min(1).max(8_000),
  evidence: z.array(agentEvidenceSchema),
  possibleConcerns: z.array(z.string().trim().min(1).max(4_000)).max(100),
  missingInformation: z.array(z.string().trim().min(1).max(4_000)).max(100),
}

export const specialistAgentModelOutputSchema = z.object(baseAgentModelOutputShape).strict()
export const coordinationAgentModelOutputSchema = z.object({ coordinatedPlan: coordinatedPlanSchema }).strict()
export const agentModelOutputSchema = z
  .object({ ...baseAgentModelOutputShape, coordinatedPlan: coordinatedPlanSchema.optional() })
  .strict()
export type AgentModelOutput = z.infer<typeof agentModelOutputSchema>
export type CoordinationAgentModelOutput = z.infer<typeof coordinationAgentModelOutputSchema>

export interface Agent<TContext extends AgentContext = AgentContext> {
  readonly name: AgentName
  readonly displayName: string
  run(context: TContext): Promise<AgentResult>
}

function isCoordinationContext(context: AgentContext): context is CoordinationAgentContext {
  return "specialistResults" in context && Array.isArray(context.specialistResults)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function toAgentError(caught: unknown): AgentError {
  const message = (caught instanceof Error ? caught.message : String(caught))
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [redacted]")
    .replace(/((?:api[-_ ]?key|authorization|token|secret)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .slice(0, 1_000)
  return {
    code: "agent_execution_error",
    message: message || "Agent execution failed.",
    retryable: false,
  }
}

// Shared by every agent (including the coordinator, via CoordinationAgentContext): opens a span,
// runs the (currently mock) model call, wraps the result into a schema-valid AgentResult, and
// guarantees run() never rejects — an internal failure becomes a status: "failed" AgentResult
// instead of a thrown error, so callers never need try/catch.
export async function runSpecialistAgent<
  TContext extends AgentContext,
  TProviderOutput extends object = AgentModelOutput,
>(params: {
  name: AgentName
  displayName: string
  context: TContext
  promptVersion?: string
  outputSchema?: z.ZodType<TProviderOutput>
  systemPrompt: string
  userPrompt: string
  maxOutputTokens?: number
  timeoutMs?: number
  maxRetries?: number
  buildModelOutput: (context: TContext) => TProviderOutput
  normalizeModelOutput?: (output: TProviderOutput, context: TContext) => AgentModelOutput
}): Promise<AgentResult> {
  const {
    name,
    displayName,
    context,
    promptVersion,
    outputSchema,
    systemPrompt,
    userPrompt,
    maxOutputTokens,
    timeoutMs,
    maxRetries,
    buildModelOutput,
    normalizeModelOutput,
  } = params
  const span = context.observability.startAgentSpan(context.trace, { agent: name, patientId: context.patient.id })
  let completionStatus: AgentStatus = "failed"

  try {
    const selectedSchema =
      outputSchema ?? (specialistAgentModelOutputSchema as unknown as z.ZodType<TProviderOutput>)
    const modelResult = await context.modelProvider.generate<TProviderOutput>({
      agent: name,
      promptVersion: promptVersion ?? context.promptVersion,
      systemPrompt,
      userPrompt,
      outputSchema: selectedSchema,
      maxOutputTokens,
      timeoutMs,
      maxRetries,
      mockResponse: buildModelOutput(context),
    })
    const modelOutput = normalizeModelOutput
      ? normalizeModelOutput(modelResult.data, context)
      : agentModelOutputSchema.parse(modelResult.data)

    context.observability.recordMetadata(span, {
      agentName: name,
      patientId: context.patient.id,
      model: modelResult.model,
      provider: modelResult.provider,
      fallbackUsed: modelResult.fallbackUsed,
      retryCount: modelResult.retryCount ?? 0,
      categorizedError: modelResult.primaryFailure?.code,
    })

    const unevaluatedResult = agentResultSchema.parse({
      agent: name,
      displayName,
      status: "evaluating",
      summary: modelOutput.summary,
      recommendation: modelOutput.recommendation,
      evidence: modelOutput.evidence,
      possibleConcerns: modelOutput.possibleConcerns,
      missingInformation: modelOutput.missingInformation,
      coordinatedPlan: modelOutput.coordinatedPlan,
      confidence: 0,
      latencyMs: modelResult.latencyMs,
      model: modelResult.model,
      provider: modelResult.provider,
      fallbackUsed: modelResult.fallbackUsed,
      evaluationStatus: "not_evaluated",
      traceId: span.spanId,
    } satisfies AgentResult)

    const evaluation = evaluateAgentResult({
      patient: context.patient,
      result: unevaluatedResult,
      specialistResults: isCoordinationContext(context) ? context.specialistResults : undefined,
    })
    const terminalStatus = evaluation.status === "pass" ? "passed" : evaluation.status
    const result = agentResultSchema.parse({
      ...unevaluatedResult,
      status: terminalStatus,
      confidence: evaluation.compositeScore,
      evaluationStatus: evaluation.status,
      evaluation,
    } satisfies AgentResult)
    completionStatus = result.status

    context.observability.recordMetadata(span, {
      agentName: name,
      patientId: context.patient.id,
      latencyMs: result.latencyMs,
      retryCount: modelResult.retryCount ?? 0,
      schemaValid: true,
      completionStatus: result.status,
      evidenceReferenceCount: result.evidence.length,
      findingCount: result.possibleConcerns.length,
    })
    context.observability.recordEvaluation(span, evaluation)
    return result
  } catch (caught) {
    const error = toAgentError(caught)
    context.observability.recordError(span, error)
    context.observability.recordMetadata(span, {
      agentName: name,
      patientId: context.patient.id,
      provider: "mock",
      model: "unknown",
      latencyMs: 0,
      retryCount: 0,
      fallbackUsed: true,
      schemaValid: false,
      completionStatus: "failed",
      categorizedError: error.code,
      evidenceReferenceCount: 0,
      findingCount: 0,
    })

    const failed = agentResultSchema.parse({
      agent: name,
      displayName,
      status: "failed",
      summary: "The agent could not complete analysis.",
      recommendation: "Automated analysis unavailable; clinician review required.",
      evidence: [],
      possibleConcerns: [],
      missingInformation: ["Automated analysis unavailable for this agent."],
      confidence: 0,
      latencyMs: 0,
      model: "unknown",
      provider: "mock",
      fallbackUsed: true,
      evaluationStatus: "not_evaluated",
      traceId: span.spanId,
      error,
    } satisfies AgentResult)

    return failed
  } finally {
    context.observability.endAgentSpan(span, completionStatus)
  }
}
