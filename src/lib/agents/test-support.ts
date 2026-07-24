import { createModelProvider, createObservabilityProvider, type ModelProvider } from "@/lib/providers"
import type { PatientRecord } from "@/lib/schemas"

import type { AgentContext } from "./agent-context"

// Shared by the agent/orchestrator test suites. Not itself a test file (no .test.ts suffix), so
// vitest's `src/**/*.test.ts` include pattern skips it.
export function createTestContext(patient: PatientRecord, overrides: Partial<AgentContext> = {}): AgentContext {
  const observability = createObservabilityProvider({
    env: { OBSERVABILITY_PROVIDER: "local" },
  })
  return {
    patient,
    modelProvider: createModelProvider(),
    observability,
    trace: observability.startAnalysisTrace({ analysisId: "test-run", patientId: patient.id }),
    promptVersion: "test@1",
    ...overrides,
  }
}

export function createThrowingModelProvider(message = "simulated model failure"): ModelProvider {
  return {
    name: "mock",
    generate: async () => {
      throw new Error(message)
    },
  }
}
