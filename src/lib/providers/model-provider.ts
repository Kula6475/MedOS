import type { z } from "zod"

import type { AgentName } from "@/lib/schemas"
import type { SafeProviderFailure } from "./fireworks-errors"

export type ModelProviderName = "mock" | "fireworks"

export interface ModelUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface ModelProviderRequest<TOutput> {
  agent: AgentName
  promptVersion: string
  systemPrompt: string
  userPrompt: string
  outputSchema: z.ZodType<TOutput>
  model?: string
  temperature?: number
  maxOutputTokens?: number
  timeoutMs?: number
  maxRetries?: number
  /** Consumed only by MockModelProvider; ignored by real providers. */
  mockResponse?: TOutput
}

export interface ModelProviderResult<TOutput> {
  data: TOutput
  model: string
  provider: ModelProviderName
  promptVersion: string
  latencyMs: number
  fallbackUsed: boolean
  attemptedProvider?: ModelProviderName
  retryCount?: number
  primaryFailure?: SafeProviderFailure
  usage?: ModelUsage
  rawContent: string
}

// Agent and route code depends only on this interface, never on the OpenAI SDK or a
// Fireworks-specific client, so the real implementation can be swapped in without touching callers.
export interface ModelProvider {
  readonly name: ModelProviderName
  generate<TOutput>(request: ModelProviderRequest<TOutput>): Promise<ModelProviderResult<TOutput>>
}
