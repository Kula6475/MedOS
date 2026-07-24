import type { AgentError, AgentName, AgentStatus, BraintrustEvaluation } from "@/lib/schemas"

export type ObservabilityProviderName = "local" | "braintrust"

export interface AnalysisTraceHandle {
  readonly kind: "trace"
  readonly traceId: string
  readonly traceUrl?: string
  readonly projectName?: string
}

export interface AgentSpanHandle {
  readonly kind: "span"
  readonly spanId: string
  readonly traceId: string
  readonly agent: AgentName
}

// Discriminated by `kind` so an implementation can safely branch on which handle it received.
export type ObservabilityTarget = AnalysisTraceHandle | AgentSpanHandle

// Agent and route code depends only on this interface, never on the Braintrust SDK directly,
// so the real implementation can be swapped in without touching callers.
export interface ObservabilityProvider {
  readonly name: ObservabilityProviderName
  startAnalysisTrace(input: { analysisId: string; patientId: string }): AnalysisTraceHandle
  startAgentSpan(trace: AnalysisTraceHandle, input: { agent: AgentName; patientId: string }): AgentSpanHandle
  recordMetadata(target: ObservabilityTarget, metadata: Record<string, unknown>): void
  recordEvaluation(target: ObservabilityTarget, evaluation: BraintrustEvaluation): void
  recordError(target: ObservabilityTarget, error: AgentError): void
  endAgentSpan(span: AgentSpanHandle, status: AgentStatus): void
  endAnalysisTrace(trace: AnalysisTraceHandle, status: AgentStatus): Promise<void>
}
