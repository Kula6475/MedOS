import { NextResponse } from "next/server"

import { runAnalysis } from "@/lib/orchestrator"
import { analyzePatientRequestSchema, apiErrorResponseSchema, type APIErrorResponse } from "@/lib/schemas"

export const dynamic = "force-dynamic"
const MAX_REQUEST_BYTES = 256 * 1024
const JSON_CONTENT_TYPE_PATTERN = /^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|$)/i

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

function errorResponse(status: number, code: string, message: string, details?: Record<string, unknown>) {
  const body: APIErrorResponse = apiErrorResponseSchema.parse({ error: { code, message, details } })
  return jsonResponse(body, status)
}

function statusForErrorCode(code: string): number {
  switch (code) {
    case "patient_not_found":
      return 404
    case "invalid_request":
    case "invalid_patient_record":
      return 400
    default:
      return 500
  }
}

// Never lets a raw exception (with a stack trace) reach the client — every path below returns a
// structured { error: { code, message } } body instead.
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
      return errorResponse(415, "unsupported_media_type", "Content-Type must be application/json.")
    }

    const declaredLength = Number(request.headers.get("content-length"))
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
      return errorResponse(413, "request_too_large", `Request body must not exceed ${MAX_REQUEST_BYTES} bytes.`)
    }

    let rawBody: unknown
    try {
      const text = await request.text()
      if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
        return errorResponse(413, "request_too_large", `Request body must not exceed ${MAX_REQUEST_BYTES} bytes.`)
      }
      rawBody = JSON.parse(text)
    } catch {
      return errorResponse(400, "invalid_json", "Request body must be valid JSON.")
    }

    const parsedRequest = analyzePatientRequestSchema.safeParse(rawBody)
    if (!parsedRequest.success) {
      return errorResponse(400, "invalid_request", "Request body failed validation.", {
        issues: parsedRequest.error.issues,
      })
    }

    const input = parsedRequest.data
    const result = await runAnalysis("patientId" in input ? { patientId: input.patientId } : { patient: input.patient })

    if (!result.ok) {
      return errorResponse(statusForErrorCode(result.error.code), result.error.code, result.error.message)
    }

    return jsonResponse(result.analysis, 200)
  } catch {
    console.error("[api/analyze] unexpected server error")
    return errorResponse(500, "internal_error", "An unexpected error occurred while processing the analysis request.")
  }
}
