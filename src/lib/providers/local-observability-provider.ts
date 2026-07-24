import { randomUUID } from "node:crypto"

import type { AgentError, AgentName, AgentStatus, BraintrustEvaluation } from "@/lib/schemas"

import type {
  AgentSpanHandle,
  AnalysisTraceHandle,
  ObservabilityProvider,
  ObservabilityTarget,
} from "./observability-provider"

const SECRET_KEY_PATTERN = /(api[-_]?key|secret|token|authorization|password)/i

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue)
  if (value !== null && typeof value === "object") return redact(value as Record<string, unknown>)
  return value
}

function redact(metadata: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    redacted[key] = SECRET_KEY_PATTERN.test(key) ? "[redacted]" : redactValue(value)
  }
  return redacted
}

function targetLabel(target: ObservabilityTarget): string {
  return target.kind === "trace" ? `trace:${target.traceId}` : `span:${target.spanId} (${target.agent})`
}

// Logs to the server console only; never reaches the browser. No hosted dashboard exists locally,
// so trace/span IDs are generated in-process and traceUrl is always omitted.
export class LocalObservabilityProvider implements ObservabilityProvider {
  readonly name = "local" as const

  startAnalysisTrace(input: { analysisId: string; patientId: string }): AnalysisTraceHandle {
    const trace: AnalysisTraceHandle = { kind: "trace", traceId: randomUUID() }
    console.log(`[observability] start trace ${trace.traceId} analysis=${input.analysisId} patient=${input.patientId}`)
    return trace
  }

  startAgentSpan(trace: AnalysisTraceHandle, input: { agent: AgentName; patientId: string }): AgentSpanHandle {
    const span: AgentSpanHandle = { kind: "span", spanId: randomUUID(), traceId: trace.traceId, agent: input.agent }
    console.log(`[observability] start span ${span.spanId} agent=${input.agent} trace=${trace.traceId}`)
    return span
  }

  recordMetadata(target: ObservabilityTarget, metadata: Record<string, unknown>): void {
    console.log(`[observability] metadata ${targetLabel(target)}`, redact(metadata))
  }

  recordEvaluation(target: ObservabilityTarget, evaluation: BraintrustEvaluation): void {
    console.log(
      `[observability] evaluation ${targetLabel(target)} status=${evaluation.status} score=${evaluation.compositeScore}`,
    )
  }

  recordError(target: ObservabilityTarget, error: AgentError): void {
    console.error(
      `[observability] error ${targetLabel(target)} code=${error.code} retryable=${error.retryable}: ${error.message}`,
    )
  }

  endAgentSpan(span: AgentSpanHandle, status: AgentStatus): void {
    console.log(`[observability] end span ${span.spanId} agent=${span.agent} status=${status}`)
  }

  async endAnalysisTrace(trace: AnalysisTraceHandle, status: AgentStatus): Promise<void> {
    console.log(`[observability] end trace ${trace.traceId} status=${status}`)
  }
}
