import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { LocalObservabilityProvider } from "./local-observability-provider"
import { MockModelProvider } from "./mock-model-provider"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("MockModelProvider", () => {
  it("returns deterministic, schema-validated output without a network call", async () => {
    const provider = new MockModelProvider()
    const request = {
      agent: "triage" as const,
      promptVersion: "test@1",
      systemPrompt: "test",
      userPrompt: "test",
      outputSchema: z.object({ value: z.literal("stable") }),
      mockResponse: { value: "stable" as const },
    }

    const first = await provider.generate(request)
    const second = await provider.generate(request)

    expect(first).toEqual(second)
    expect(first.provider).toBe("mock")
    expect(first.fallbackUsed).toBe(true)
  })

  it("rejects malformed mock output through the supplied Zod schema", async () => {
    const provider = new MockModelProvider()

    await expect(
      provider.generate({
        agent: "triage",
        promptVersion: "test@1",
        systemPrompt: "test",
        userPrompt: "test",
        outputSchema: z.object({ safe: z.literal(true) }),
        mockResponse: { safe: false } as unknown as { safe: true },
      }),
    ).rejects.toBeInstanceOf(z.ZodError)
  })
})

describe("LocalObservabilityProvider", () => {
  it("redacts nested credential-like metadata before logging", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const provider = new LocalObservabilityProvider()
    const trace = provider.startAnalysisTrace({ analysisId: "analysis-test", patientId: "SYNTHETIC-1" })

    provider.recordMetadata(trace, {
      apiKey: "must-not-leak",
      nested: { authorization: "must-not-leak-either", safe: "visible" },
    })

    const serializedCalls = JSON.stringify(log.mock.calls)
    expect(serializedCalls).not.toContain("must-not-leak")
    expect(serializedCalls).toContain("[redacted]")
    expect(serializedCalls).toContain("visible")
  })
})
