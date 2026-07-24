import OpenAI from "openai"

import { ModelProviderError, normalizeFireworksError } from "./fireworks-errors"
import { toFireworksJsonSchema } from "./fireworks-schema"
import type { ModelProvider, ModelProviderRequest, ModelProviderResult } from "./model-provider"

const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1"
const DEFAULT_MODEL = "accounts/fireworks/models/gpt-oss-120b"
const DEFAULT_TIMEOUT_MS = 12_000
const DEFAULT_MAX_OUTPUT_TOKENS = 2_000
const MAX_RETRIES = 1

if (typeof window !== "undefined") {
  throw new Error("fireworks-model-provider.ts is server-only and must not be imported into client code.")
}

export interface FireworksModelProviderOptions {
  apiKey?: string
  model?: string
  client?: OpenAI
  timeoutMs?: number
  sleep?: (milliseconds: number) => Promise<void>
  now?: () => number
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function retryDelayMs(attempt: number): number {
  return 200 * 2 ** attempt
}

function schemaName(agent: string): string {
  return `medos_${agent.replaceAll("-", "_")}_result`
}

export class FireworksModelProvider implements ModelProvider {
  readonly name = "fireworks" as const
  private readonly apiKey?: string
  private readonly configuredModel: string
  private readonly injectedClient?: OpenAI
  private runtimeClient?: OpenAI
  private readonly defaultTimeoutMs: number
  private readonly sleep: (milliseconds: number) => Promise<void>
  private readonly now: () => number

  constructor(options: FireworksModelProviderOptions = {}) {
    this.apiKey = options.apiKey
    this.configuredModel = options.model?.trim() || DEFAULT_MODEL
    this.injectedClient = options.client
    this.defaultTimeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.sleep = options.sleep ?? defaultSleep
    this.now = options.now ?? Date.now
  }

  private client(): OpenAI {
    if (this.injectedClient) return this.injectedClient
    if (!this.apiKey) {
      throw new ModelProviderError({
        code: "missing_configuration",
        message: "FIREWORKS_API_KEY is required when MODEL_PROVIDER is set to fireworks.",
        retryable: false,
        retryCount: 0,
      })
    }
    this.runtimeClient ??= new OpenAI({ apiKey: this.apiKey, baseURL: FIREWORKS_BASE_URL, maxRetries: 0 })
    return this.runtimeClient
  }

  private async execute<TOutput>(
    request: ModelProviderRequest<TOutput>,
    model: string,
  ): Promise<ModelProviderResult<TOutput>> {
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs
    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort()
        reject(
          new ModelProviderError({
            code: "timeout",
            message: `Fireworks request exceeded the ${timeoutMs} ms timeout.`,
            retryable: true,
            retryCount: 0,
          }),
        )
      }, timeoutMs)
    })

    try {
      const completionPromise = this.client().chat.completions.create(
        {
          model,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0,
          max_tokens: request.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: schemaName(request.agent),
              schema: toFireworksJsonSchema(request.outputSchema),
            },
          },
        },
        { signal: controller.signal },
      )
      const completion = await Promise.race([completionPromise, timeout])
      const choice = completion.choices[0]
      if (!choice || choice.finish_reason === "length") {
        throw new ModelProviderError({
          code: "invalid_response",
          message: choice?.finish_reason === "length" ? "Fireworks output was truncated." : "Fireworks returned no completion.",
          retryable: false,
          retryCount: 0,
        })
      }

      const content = choice.message.content
      if (typeof content !== "string" || content.trim().length === 0) {
        throw new ModelProviderError({
          code: "invalid_response",
          message: "Fireworks returned empty structured output.",
          retryable: false,
          retryCount: 0,
        })
      }

      let decoded: unknown
      try {
        decoded = JSON.parse(content)
      } catch {
        throw new ModelProviderError({
          code: "invalid_response",
          message: "Fireworks returned malformed JSON.",
          retryable: false,
          retryCount: 0,
        })
      }

      const parsed = request.outputSchema.safeParse(decoded)
      if (!parsed.success) {
        throw new ModelProviderError({
          code: "invalid_response",
          message: "Fireworks structured output failed Zod validation.",
          retryable: false,
          retryCount: 0,
        })
      }
      return {
        data: parsed.data,
        model: completion.model || model,
        provider: "fireworks",
        promptVersion: request.promptVersion,
        latencyMs: 0,
        fallbackUsed: false,
        retryCount: 0,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
        rawContent: content,
      }
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }

  async generate<TOutput>(request: ModelProviderRequest<TOutput>): Promise<ModelProviderResult<TOutput>> {
    const startedAt = this.now()
    const model = request.model ?? this.configuredModel
    const maxRetries = request.maxRetries ?? MAX_RETRIES
    let retryCount = 0

    while (true) {
      try {
        const result = await this.execute(request, model)
        return { ...result, latencyMs: Math.max(0, this.now() - startedAt), retryCount }
      } catch (caught) {
        const error = normalizeFireworksError(caught, retryCount)
        if (!error.retryable || retryCount >= maxRetries) throw error
        await this.sleep(retryDelayMs(retryCount))
        retryCount += 1
      }
    }
  }
}
