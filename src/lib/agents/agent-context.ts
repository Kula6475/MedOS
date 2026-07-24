import type { AgentResult, PatientRecord } from "@/lib/schemas"
import type { AnalysisTraceHandle, ModelProvider, ObservabilityProvider } from "@/lib/providers"

export interface AgentContext {
  patient: PatientRecord
  modelProvider: ModelProvider
  observability: ObservabilityProvider
  trace: AnalysisTraceHandle
  promptVersion: string
}

// The Care Coordination Agent is the only agent that also needs the other four agents' completed
// results; every other agent uses the base AgentContext.
export interface CoordinationAgentContext extends AgentContext {
  specialistResults: AgentResult[]
}
