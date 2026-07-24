import { FallbackModelProvider } from "./fallback-model-provider"
import { BraintrustObservabilityProvider } from "./braintrust-observability-provider"
import { FireworksModelProvider } from "./fireworks-model-provider"
import { LocalObservabilityProvider } from "./local-observability-provider"
import { MockModelProvider } from "./mock-model-provider"
import type { ModelProvider } from "./model-provider"
import type { ObservabilityProvider } from "./observability-provider"

// This module reads process.env and must never be imported by a client component.
if (typeof window !== "undefined") {
  throw new Error("provider-factory.ts is server-only and must not be imported into client code.")
}

export type ModelProviderMode = "mock" | "fireworks"
export type ObservabilityProviderMode = "local" | "braintrust"
export type ProviderEnvironment = Record<string, string | undefined>

export function resolveModelProviderMode(): ModelProviderMode {
  return process.env.MODEL_PROVIDER === "fireworks" ? "fireworks" : "mock"
}

export function resolveObservabilityProviderMode(
  env: ProviderEnvironment = process.env,
): ObservabilityProviderMode {
  return env.OBSERVABILITY_PROVIDER === "braintrust" ? "braintrust" : "local"
}

// Defaults to mock/local so the app runs with zero credentials. Fireworks mode retains the
// deterministic mock as an explicit per-request fallback for missing configuration, transient
// provider failures, timeouts, and malformed output.
export function createModelProvider(): ModelProvider {
  const mode = resolveModelProviderMode()
  if (mode === "fireworks") {
    return new FallbackModelProvider(
      new FireworksModelProvider({
        apiKey: process.env.FIREWORKS_API_KEY,
        model: process.env.FIREWORKS_MODEL,
      }),
      new MockModelProvider(),
    )
  }
  return new MockModelProvider()
}

export interface ObservabilityProviderFactoryOptions {
  env?: ProviderEnvironment
  localFactory?: () => ObservabilityProvider
  braintrustFactory?: (configuration: {
    apiKey: string
    projectName: string
    appUrl?: string
    orgName?: string
  }) => ObservabilityProvider
}

export function createObservabilityProvider(options: ObservabilityProviderFactoryOptions = {}): ObservabilityProvider {
  const env = options.env ?? process.env
  const localFactory = options.localFactory ?? (() => new LocalObservabilityProvider())
  if (resolveObservabilityProviderMode(env) !== "braintrust") return localFactory()

  const apiKey = env.BRAINTRUST_API_KEY?.trim()
  if (!apiKey) {
    console.warn("[braintrust] configuration missing; using local observability")
    return localFactory()
  }

  const braintrustFactory =
    options.braintrustFactory ??
    ((configuration) =>
      new BraintrustObservabilityProvider({
        ...configuration,
        localFallback: localFactory(),
      }))

  try {
    return braintrustFactory({
      apiKey,
      projectName: env.BRAINTRUST_PROJECT_NAME?.trim() || "MedOS",
      appUrl: env.BRAINTRUST_APP_URL?.trim() || undefined,
      orgName: env.BRAINTRUST_ORG_NAME?.trim() || undefined,
    })
  } catch {
    console.warn("[braintrust] initialization failed; using local observability")
    return localFactory()
  }
}
