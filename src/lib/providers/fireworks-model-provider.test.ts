import type OpenAI from "openai"
import { afterEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { runAnalysis } from "@/lib/orchestrator"

import { FallbackModelProvider } from "./fallback-model-provider"
import { ModelProviderError, normalizeFireworksError } from "./fireworks-errors"
import { FireworksModelProvider } from "./fireworks-model-provider"
import { toFireworksJsonSchema } from "./fireworks-schema"
import { MockModelProvider } from "./mock-model-provider"
import { createModelProvider, resolveModelProviderMode } from "./provider-factory"
import type { ModelProviderRequest } from "./model-provider"

const outputSchema = z.object({ value: z.string().min(1).max(20) }).strict()
type Output = z.infer<typeof outputSchema>

function request(overrides: Partial<ModelProviderRequest<Output>> = {}): ModelProviderRequest<Output> {
  return {
    agent: "triage",
    promptVersion: "test@1",
    systemPrompt: "Return safe JSON.",
    userPrompt: "Synthetic test input.",
    outputSchema,
    mockResponse: { value: "fallback" },
    ...overrides,
  }
}

function completion(content: string | null, finishReason = "stop") {
  return {
    id: "completion-test",
    object: "chat.completion",
    created: 0,
    model: "accounts/fireworks/models/gpt-oss-120b",
    choices: [
      {
        index: 0,
        finish_reason: finishReason,
        logprobs: null,
        message: { role: "assistant", content, refusal: null },
      },
    ],
    usage: { prompt_tokens: 12, completion_tokens: 5, total_tokens: 17 },
  }
}

function fakeClient<TArgs extends unknown[]>(create: (...args: TArgs) => Promise<unknown>): OpenAI {
  return { chat: { completions: { create } } } as unknown as OpenAI
}

const originalModelProvider = process.env.MODEL_PROVIDER
const originalFireworksKey = process.env.FIREWORKS_API_KEY

afterEach(() => {
  vi.restoreAllMocks()
  if (originalModelProvider === undefined) delete process.env.MODEL_PROVIDER
  else process.env.MODEL_PROVIDER = originalModelProvider
  if (originalFireworksKey === undefined) delete process.env.FIREWORKS_API_KEY
  else process.env.FIREWORKS_API_KEY = originalFireworksKey
})

describe("FireworksModelProvider", () => {
  it("requests structured JSON and validates the response with Zod", async () => {
    const create = vi.fn(async (body: Record<string, unknown>) => {
      void body
      return completion('{"value":"live"}')
    })
    const times = [100, 155]
    const provider = new FireworksModelProvider({
      client: fakeClient(create),
      now: () => times.shift() ?? 155,
    })

    const result = await provider.generate(request())

    expect(result.data).toEqual({ value: "live" })
    expect(result.provider).toBe("fireworks")
    expect(result.fallbackUsed).toBe(false)
    expect(result.latencyMs).toBe(55)
    expect(result.usage).toEqual({ promptTokens: 12, completionTokens: 5, totalTokens: 17 })
    expect(create).toHaveBeenCalledTimes(1)
    const body = create.mock.calls[0][0]
    expect(body.response_format).toMatchObject({ type: "json_schema" })
    expect(body.messages).toEqual([
      { role: "system", content: "Return safe JSON." },
      { role: "user", content: "Synthetic test input." },
    ])
  })

  it.each([
    ["malformed JSON", "not-json", "stop"],
    ["schema-invalid JSON", '{"value":""}', "stop"],
    ["truncated JSON", '{"value":"live"}', "length"],
  ])("rejects %s without retrying", async (_label, content, finishReason) => {
    const create = vi.fn(async () => completion(content, finishReason))
    const provider = new FireworksModelProvider({ client: fakeClient(create), sleep: async () => undefined })

    await expect(provider.generate(request())).rejects.toMatchObject({ code: "invalid_response", retryable: false })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it.each([408, 429, 502, 503, 504, 520])("retries documented transient status %i exactly once", async (status) => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("transient Fireworks failure"), { status }))
      .mockResolvedValueOnce(completion('{"value":"live"}'))
    const sleep = vi.fn(async () => undefined)
    const provider = new FireworksModelProvider({ client: fakeClient(create), sleep })

    const result = await provider.generate(request())

    expect(create).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledWith(200)
    expect(result.retryCount).toBe(1)
  })

  it.each([400, 401, 402, 403, 404, 405, 412, 413])("does not retry non-transient status %i", async (status) => {
    const create = vi.fn(async () => {
      throw Object.assign(new Error("non-transient Fireworks failure"), { status })
    })
    const provider = new FireworksModelProvider({ client: fakeClient(create), sleep: async () => undefined })

    await expect(provider.generate(request())).rejects.toMatchObject({ retryable: false })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it("times out, retries once, and exposes only a normalized error", async () => {
    const create = vi.fn(() => new Promise(() => undefined))
    const provider = new FireworksModelProvider({ client: fakeClient(create), timeoutMs: 1, sleep: async () => undefined })

    await expect(provider.generate(request())).rejects.toMatchObject({ code: "timeout", retryCount: 1 })
    expect(create).toHaveBeenCalledTimes(2)
  })

  it("honors a request-specific zero-retry policy", async () => {
    const create = vi.fn(async () => {
      throw Object.assign(new Error("temporarily unavailable"), { status: 503 })
    })
    const sleep = vi.fn(async () => undefined)
    const provider = new FireworksModelProvider({ client: fakeClient(create), sleep })

    await expect(provider.generate(request({ maxRetries: 0 }))).rejects.toMatchObject({
      code: "provider_unavailable",
      retryCount: 0,
    })
    expect(create).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })
})

describe("Fireworks provider fallback", () => {
  it("uses deterministic mock output when the Fireworks key is missing", async () => {
    const provider = new FallbackModelProvider(new FireworksModelProvider(), new MockModelProvider())

    const result = await provider.generate(request())

    expect(result.data).toEqual({ value: "fallback" })
    expect(result.provider).toBe("mock")
    expect(result.attemptedProvider).toBe("fireworks")
    expect(result.fallbackUsed).toBe(true)
    expect(result.primaryFailure).toMatchObject({ code: "missing_configuration", retryable: false })
  })

  it("completes all five agents through deterministic fallback without a key", async () => {
    const provider = new FallbackModelProvider(new FireworksModelProvider(), new MockModelProvider())

    const result = await runAnalysis({ patientId: "MED-1042", modelProvider: provider })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.analysis.agents).toHaveLength(5)
    expect(result.analysis.agents.every((agent) => agent.provider === "mock" && agent.fallbackUsed)).toBe(true)
    expect(result.analysis.agents.every((agent) => agent.status === "passed")).toBe(true)
  })

  it("selects Fireworks through MODEL_PROVIDER while retaining fallback", () => {
    process.env.MODEL_PROVIDER = "fireworks"
    delete process.env.FIREWORKS_API_KEY

    expect(resolveModelProviderMode()).toBe("fireworks")
    expect(createModelProvider()).toBeInstanceOf(FallbackModelProvider)
  })
})

describe("Fireworks schema and safe errors", () => {
  it("removes unsupported generation constraints while retaining object structure", () => {
    const schema = toFireworksJsonSchema(
      z.object({ value: z.string().min(2).max(5).regex(/^safe$/), entries: z.array(z.number()).max(2) }).strict(),
    )
    const serialized = JSON.stringify(schema)

    expect(serialized).not.toMatch(/minLength|maxLength|minItems|maxItems|pattern|format/)
    expect(schema).toMatchObject({ type: "object", additionalProperties: false })
  })

  it("redacts credentials and bounds provider error messages", () => {
    const secret = "secret-value-that-must-not-leak"
    const error = normalizeFireworksError(
      Object.assign(new Error(`Authorization: Bearer ${secret} api_key=${secret} ${"x".repeat(2_000)}`), { status: 503 }),
      1,
    )

    expect(error.message).not.toContain(secret)
    expect(error.message.length).toBeLessThanOrEqual(1_000)
    expect(error).toBeInstanceOf(ModelProviderError)
    expect(error.retryable).toBe(true)
  })
})
