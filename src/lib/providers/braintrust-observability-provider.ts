import { randomUUID } from "node:crypto"
import {
  initLogger,
  setMaskingFunction,
  type ExperimentLogPartialArgs,
  type StartSpanArgs,
} from "braintrust"

import type { AgentError, AgentName, AgentStatus, BraintrustEvaluation } from "@/lib/schemas"

import { LocalObservabilityProvider } from "./local-observability-provider"
import type {
  AgentSpanHandle,
  AnalysisTraceHandle,
  ObservabilityProvider,
  ObservabilityTarget,
} from "./observability-provider"

if (typeof window !== "undefined") {
  throw new Error("braintrust-observability-provider.ts is server-only and must not be imported into client code.")
}

const SECRET_KEY_PATTERN = /(api[-_]?key|secret|token|authorization|password|credential)/i
const MAX_SAFE_STRING_LENGTH = 1_000
const ROOT_METADATA_KEYS = new Set([
  "analysisId",
  "patientId",
  "workflowVersion",
  "modelProviderMode",
  "observabilityProviderMode",
  "specialistCount",
  "workflowCompletionStatus",
  "totalLatencyMs",
  "partialFailureCount",
])
const AGENT_METADATA_KEYS = new Set([
  "agentName",
  "patientId",
  "provider",
  "model",
  "latencyMs",
  "retryCount",
  "fallbackUsed",
  "schemaValid",
  "completionStatus",
  "categorizedError",
  "evidenceReferenceCount",
  "findingCount",
])

export interface BraintrustSpanLike {
  readonly spanId: string
  readonly rootSpanId: string
  startSpan(args?: StartSpanArgs): BraintrustSpanLike
  log(event: ExperimentLogPartialArgs): void
  end(): number
  link(): string
}

export interface BraintrustLoggerLike {
  startSpan(args?: StartSpanArgs): BraintrustSpanLike
  flush(): Promise<void>
}

export interface BraintrustObservabilityProviderOptions {
  apiKey: string
  projectName: string
  appUrl?: string
  orgName?: string
  logger?: BraintrustLoggerLike
  localFallback?: ObservabilityProvider
  maskingSetter?: (masker: (value: unknown) => unknown) => void
}

function boundedString(value: string): string {
  return value.slice(0, MAX_SAFE_STRING_LENGTH)
}

export function maskBraintrustValue(value: unknown): unknown {
  if (typeof value === "string") {
    return boundedString(
      value
        .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [redacted]")
        .replace(/((?:api[-_ ]?key|authorization|token|secret|password|credential)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]"),
    )
  }
  if (Array.isArray(value)) return value.map(maskBraintrustValue)
  if (value !== null && typeof value === "object") {
    const masked: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      masked[key] = SECRET_KEY_PATTERN.test(key) ? "[redacted]" : maskBraintrustValue(nested)
    }
    return masked
  }
  return value
}

function filterMetadata(target: ObservabilityTarget, metadata: Record<string, unknown>): Record<string, unknown> {
  const allowed = target.kind === "trace" ? ROOT_METADATA_KEYS : AGENT_METADATA_KEYS
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (allowed.has(key)) filtered[key] = maskBraintrustValue(value)
  }
  return filtered
}

function metricsFor(target: ObservabilityTarget, metadata: Record<string, unknown>): Record<string, number> {
  const metrics: Record<string, number> = {}
  const add = (name: string, value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) metrics[name] = Math.max(0, value)
  }
  if (target.kind === "trace") {
    add("total_latency_ms", metadata.totalLatencyMs)
    add("partial_failure_count", metadata.partialFailureCount)
  } else {
    add("latency_ms", metadata.latencyMs)
    add("retry_count", metadata.retryCount)
    add("evidence_reference_count", metadata.evidenceReferenceCount)
    add("finding_count", metadata.findingCount)
  }
  return metrics
}

export function normalizeBraintrustScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.min(1, Math.max(0, score / 100))
}

export function evaluationToBraintrustScores(evaluation: BraintrustEvaluation): Record<string, number> {
  return {
    ...Object.fromEntries(Object.entries(evaluation.scores).map(([name, score]) => [name, normalizeBraintrustScore(score)])),
    ...Object.fromEntries(evaluation.checks.map((check) => [check.name, normalizeBraintrustScore(check.score)])),
    compositeScore: normalizeBraintrustScore(evaluation.compositeScore),
  }
}

function safeWarning(category: string): void {
  console.warn(`[braintrust] observability degraded category=${category}; continuing with local observability`)
}

export class BraintrustObservabilityProvider implements ObservabilityProvider {
  readonly name = "braintrust" as const
  private readonly logger: BraintrustLoggerLike
  private readonly projectName: string
  private readonly orgName?: string
  private readonly appUrl: string
  private readonly local: ObservabilityProvider
  private readonly roots = new Map<string, BraintrustSpanLike>()
  private readonly spans = new Map<string, BraintrustSpanLike>()
  private readonly localTraces = new Map<string, AnalysisTraceHandle>()
  private readonly localSpans = new Map<string, AgentSpanHandle>()
  private readonly endedTraces = new Set<string>()
  private readonly endedSpans = new Set<string>()

  constructor(options: BraintrustObservabilityProviderOptions) {
    const apiKey = options.apiKey.trim()
    if (!apiKey) throw new Error("Braintrust configuration is incomplete.")
    this.projectName = options.projectName.trim() || "MedOS"
    this.orgName = options.orgName?.trim() || undefined
    this.appUrl = (options.appUrl?.trim() || "https://www.braintrust.dev").replace(/\/+$/, "")
    this.local = options.localFallback ?? new LocalObservabilityProvider()

    const maskingSetter = options.maskingSetter ?? setMaskingFunction
    maskingSetter(maskBraintrustValue)
    this.logger =
      options.logger ??
      (initLogger({
        apiKey,
        projectName: this.projectName,
        appUrl: options.appUrl?.trim() || undefined,
        orgName: options.orgName?.trim() || undefined,
        setCurrent: false,
        asyncFlush: true,
        onFlushError: () => safeWarning("background_flush_failure"),
      }) as unknown as BraintrustLoggerLike)
  }

  private localTraceFor(traceId: string): AnalysisTraceHandle | undefined {
    return this.localTraces.get(traceId)
  }

  private localTargetFor(target: ObservabilityTarget): ObservabilityTarget | undefined {
    return target.kind === "trace" ? this.localTraceFor(target.traceId) : this.localSpans.get(target.spanId)
  }

  private braintrustSpanFor(target: ObservabilityTarget): BraintrustSpanLike | undefined {
    return target.kind === "trace" ? this.roots.get(target.traceId) : this.spans.get(target.spanId)
  }

  startAnalysisTrace(input: { analysisId: string; patientId: string }): AnalysisTraceHandle {
    const localTrace = this.local.startAnalysisTrace(input)
    try {
      const root = this.logger.startSpan({
        name: "patient-analysis",
        type: "task",
        event: {
          metadata: {
            analysisId: boundedString(input.analysisId),
            patientId: boundedString(input.patientId),
          },
          tags: ["medos", "synthetic", "patient-analysis"],
        },
      })
      const traceId = root.rootSpanId || root.spanId || randomUUID()
      let traceUrl: string | undefined
      try {
        const link = root.link()
        // The SDK returns an "error-generating-link" placeholder when it cannot resolve the org
        // (e.g. BRAINTRUST_ORG_NAME unset or an invalid API key). That URL 404s, so never surface
        // it — only a genuine permalink is used.
        if (/^https:\/\//i.test(link) && !link.includes("error-generating-link")) {
          traceUrl = link
        }
      } catch {
        safeWarning("trace_link_failure")
      }
      // When the org is known but a per-span permalink was unavailable, fall back to the project's
      // Logs view so the link resolves to a real Braintrust page instead of a dead URL.
      if (!traceUrl && this.orgName) {
        traceUrl = `${this.appUrl}/app/${encodeURIComponent(this.orgName)}/p/${encodeURIComponent(this.projectName)}/logs`
      }
      const trace: AnalysisTraceHandle = {
        kind: "trace",
        traceId,
        traceUrl,
        projectName: this.projectName,
      }
      this.roots.set(traceId, root)
      this.localTraces.set(traceId, localTrace)
      return trace
    } catch {
      safeWarning("root_span_start_failure")
      const trace = { ...localTrace, projectName: "medos-local" }
      this.localTraces.set(trace.traceId, localTrace)
      return trace
    }
  }

  startAgentSpan(trace: AnalysisTraceHandle, input: { agent: AgentName; patientId: string }): AgentSpanHandle {
    const localTrace = this.localTraceFor(trace.traceId) ?? trace
    const localSpan = this.local.startAgentSpan(localTrace, input)
    const root = this.roots.get(trace.traceId)
    if (!root) {
      this.localSpans.set(localSpan.spanId, localSpan)
      return localSpan
    }

    try {
      const span = root.startSpan({
        name: `${input.agent}-agent`,
        type: "task",
        event: {
          metadata: { agentName: input.agent, patientId: boundedString(input.patientId) },
          tags: ["medos", "agent", input.agent],
        },
      })
      const handle: AgentSpanHandle = {
        kind: "span",
        spanId: span.spanId || randomUUID(),
        traceId: trace.traceId,
        agent: input.agent,
      }
      this.spans.set(handle.spanId, span)
      this.localSpans.set(handle.spanId, localSpan)
      return handle
    } catch {
      safeWarning("agent_span_start_failure")
      this.localSpans.set(localSpan.spanId, localSpan)
      return localSpan
    }
  }

  recordMetadata(target: ObservabilityTarget, metadata: Record<string, unknown>): void {
    const filtered = filterMetadata(target, metadata)
    const metrics = metricsFor(target, metadata)
    const localTarget = this.localTargetFor(target)
    if (localTarget) {
      try {
        this.local.recordMetadata(localTarget, filtered)
      } catch {
        safeWarning("local_metadata_failure")
      }
    }
    const span = this.braintrustSpanFor(target)
    if (!span || (Object.keys(filtered).length === 0 && Object.keys(metrics).length === 0)) return
    try {
      span.log({ metadata: filtered, metrics })
    } catch {
      safeWarning("metadata_logging_failure")
    }
  }

  recordEvaluation(target: ObservabilityTarget, evaluation: BraintrustEvaluation): void {
    const localTarget = this.localTargetFor(target)
    if (localTarget) {
      try {
        this.local.recordEvaluation(localTarget, evaluation)
      } catch {
        safeWarning("local_evaluation_failure")
      }
    }
    const span = this.braintrustSpanFor(target)
    if (!span) return
    try {
      span.log({
        scores: evaluationToBraintrustScores(evaluation),
        metadata: {
          evaluationMethod: "deterministic_safety_heuristics",
          clinicalAccuracyScore: false,
          evaluationStatus: evaluation.status,
        },
      })
    } catch {
      safeWarning("evaluation_logging_failure")
    }
  }

  recordError(target: ObservabilityTarget, error: AgentError): void {
    const localTarget = this.localTargetFor(target)
    if (localTarget) {
      try {
        this.local.recordError(localTarget, {
          code: boundedString(error.code),
          message: "Observability-safe categorized error; details omitted.",
          retryable: error.retryable,
        })
      } catch {
        safeWarning("local_error_logging_failure")
      }
    }
    if (target.kind !== "span") return
    const span = this.spans.get(target.spanId)
    if (!span) return
    try {
      span.log({ metadata: { categorizedError: boundedString(error.code) } })
    } catch {
      safeWarning("error_logging_failure")
    }
  }

  endAgentSpan(spanHandle: AgentSpanHandle, status: AgentStatus): void {
    if (this.endedSpans.has(spanHandle.spanId)) return
    this.endedSpans.add(spanHandle.spanId)
    const localSpan = this.localSpans.get(spanHandle.spanId)
    if (localSpan) {
      try {
        this.local.endAgentSpan(localSpan, status)
      } catch {
        safeWarning("local_agent_end_failure")
      }
    }
    const span = this.spans.get(spanHandle.spanId)
    if (!span) {
      this.localSpans.delete(spanHandle.spanId)
      return
    }
    try {
      span.log({ metadata: { completionStatus: status } })
    } catch {
      safeWarning("agent_completion_logging_failure")
    }
    try {
      span.end()
    } catch {
      safeWarning("agent_span_end_failure")
    } finally {
      this.spans.delete(spanHandle.spanId)
      this.localSpans.delete(spanHandle.spanId)
    }
  }

  async endAnalysisTrace(trace: AnalysisTraceHandle, status: AgentStatus): Promise<void> {
    if (this.endedTraces.has(trace.traceId)) return
    this.endedTraces.add(trace.traceId)
    const localTrace = this.localTraceFor(trace.traceId)
    if (localTrace) {
      try {
        await this.local.endAnalysisTrace(localTrace, status)
      } catch {
        safeWarning("local_trace_end_failure")
      }
    }
    const root = this.roots.get(trace.traceId)
    if (root) {
      try {
        root.log({ metadata: { workflowCompletionStatus: status } })
      } catch {
        safeWarning("root_completion_logging_failure")
      }
      try {
        root.end()
      } catch {
        safeWarning("root_span_end_failure")
      } finally {
        this.roots.delete(trace.traceId)
        this.localTraces.delete(trace.traceId)
      }
    } else {
      this.localTraces.delete(trace.traceId)
    }
    try {
      await this.logger.flush()
    } catch {
      safeWarning("flush_failure")
    }
  }
}
