export type ModelProviderErrorCode =
  | "missing_configuration"
  | "authentication_error"
  | "billing_error"
  | "permission_error"
  | "bad_request"
  | "model_unavailable"
  | "payload_too_large"
  | "rate_limited"
  | "timeout"
  | "network_error"
  | "invalid_response"
  | "provider_unavailable"
  | "unknown_provider_error"

const MAX_SAFE_ERROR_LENGTH = 1_000
const RETRYABLE_STATUS_CODES = new Set([408, 429, 502, 503, 504, 520])

export interface SafeProviderFailure {
  code: ModelProviderErrorCode
  message: string
  retryable: boolean
  status?: number
  retryCount: number
  requestId?: string
}

export class ModelProviderError extends Error implements SafeProviderFailure {
  readonly code: ModelProviderErrorCode
  readonly retryable: boolean
  readonly status?: number
  readonly retryCount: number
  readonly requestId?: string

  constructor(failure: SafeProviderFailure, options?: ErrorOptions) {
    super(failure.message, options)
    this.name = "ModelProviderError"
    this.code = failure.code
    this.retryable = failure.retryable
    this.status = failure.status
    this.retryCount = failure.retryCount
    this.requestId = failure.requestId
  }
}

function redactAndBound(message: string): string {
  return message
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer [redacted]")
    .replace(/((?:api[-_ ]?key|authorization|token|secret)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .slice(0, MAX_SAFE_ERROR_LENGTH)
}

function statusCodeFor(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined
  const status = (error as { status?: unknown }).status
  return typeof status === "number" ? status : undefined
}

function requestIdFor(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined
  const candidate = error as { request_id?: unknown; requestId?: unknown }
  const requestId = candidate.request_id ?? candidate.requestId
  return typeof requestId === "string" ? redactAndBound(requestId).slice(0, 200) : undefined
}

function codeForStatus(status: number | undefined): ModelProviderErrorCode {
  switch (status) {
    case 400:
    case 405:
      return "bad_request"
    case 401:
      return "authentication_error"
    case 402:
    case 412:
      return "billing_error"
    case 403:
      return "permission_error"
    case 404:
      return "model_unavailable"
    case 408:
    case 504:
      return "timeout"
    case 413:
      return "payload_too_large"
    case 429:
      return "rate_limited"
    case 500:
    case 502:
    case 503:
    case 520:
      return "provider_unavailable"
    default:
      return "unknown_provider_error"
  }
}

export function normalizeFireworksError(error: unknown, retryCount: number): ModelProviderError {
  if (error instanceof ModelProviderError) {
    return new ModelProviderError({
      code: error.code,
      message: redactAndBound(error.message),
      retryable: error.retryable,
      status: error.status,
      retryCount,
      requestId: error.requestId,
    })
  }

  const status = statusCodeFor(error)
  const rawMessage = error instanceof Error ? error.message : "Fireworks inference failed."
  const isAbort = error instanceof Error && (error.name === "AbortError" || /aborted|timeout/i.test(error.message))
  const code = isAbort ? "timeout" : status === undefined ? "network_error" : codeForStatus(status)
  const retryable = isAbort || status === undefined || (status !== undefined && RETRYABLE_STATUS_CODES.has(status))

  return new ModelProviderError({
    code,
    message: redactAndBound(rawMessage || "Fireworks inference failed."),
    retryable,
    status,
    retryCount,
    requestId: requestIdFor(error),
  })
}

export function safeProviderFailure(error: unknown): SafeProviderFailure {
  const retryCount = error instanceof ModelProviderError ? error.retryCount : 0
  const normalized = normalizeFireworksError(error, retryCount)
  return {
    code: normalized.code,
    message: normalized.message,
    retryable: normalized.retryable,
    status: normalized.status,
    retryCount: normalized.retryCount,
    requestId: normalized.requestId,
  }
}
