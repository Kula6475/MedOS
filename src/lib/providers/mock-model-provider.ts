import type { AgentName } from "@/lib/schemas"

import type { ModelProvider, ModelProviderRequest, ModelProviderResult } from "./model-provider"

// Deterministic per-agent simulated latency (matches the frontend's existing mock timings for
// narrative continuity). Never measured from real elapsed time — real timing would make identical
// inputs produce different outputs run to run, which breaks reproducibility.
const SIMULATED_LATENCY_MS: Record<AgentName, number> = {
  triage: 684,
  "medication-safety": 742,
  "lab-analysis": 816,
  "imaging-review": 903,
  "care-coordination": 1124,
}

// No network calls. Validates whatever request.mockResponse the caller supplies against
// request.outputSchema — still schema-validated, not a rubber stamp — rather than a generic
// zod-schema faker. Every field returned is a pure function of the request, so the same
// mockResponse always produces the same ModelProviderResult.
export class MockModelProvider implements ModelProvider {
  readonly name = "mock" as const

  async generate<TOutput>(request: ModelProviderRequest<TOutput>): Promise<ModelProviderResult<TOutput>> {
    if (request.mockResponse === undefined) {
      throw new Error(
        `MockModelProvider has no mockResponse configured for agent "${request.agent}". Pass request.mockResponse to use the mock provider.`,
      )
    }

    const data = request.outputSchema.parse(request.mockResponse)

    return {
      data,
      model: request.model ?? "mock-model",
      provider: "mock",
      promptVersion: request.promptVersion,
      latencyMs: SIMULATED_LATENCY_MS[request.agent],
      fallbackUsed: true,
      rawContent: JSON.stringify(data),
    }
  }
}
