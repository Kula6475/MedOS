import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { buildPatientFromIntake, extractIntakeFromText } from "@/lib/intake"
import { patientRecordSchema } from "@/lib/schemas"

export const dynamic = "force-dynamic"
const MAX_REQUEST_BYTES = 256 * 1024
const JSON_CONTENT_TYPE_PATTERN = /^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|$)/i

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } }
}

// POST /api/intake
//   { "text": "<free-text clinical note>" }  -> AI structures it into a synthetic PatientRecord
//   { "patient": { ...PatientRecord } }      -> validates/normalizes an uploaded structured record
// Always returns { patient, source, ... }. The returned patient is then sent to /api/analyze.
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
      return json(errorBody("unsupported_media_type", "Content-Type must be application/json."), 415)
    }

    const text = await request.text()
    if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
      return json(errorBody("request_too_large", `Request body must not exceed ${MAX_REQUEST_BYTES} bytes.`), 413)
    }

    let raw: unknown
    try {
      raw = JSON.parse(text)
    } catch {
      return json(errorBody("invalid_json", "Request body must be valid JSON."), 400)
    }

    if (!raw || typeof raw !== "object") {
      return json(errorBody("invalid_request", "Provide either a 'text' string or a 'patient' object."), 400)
    }
    const body = raw as { text?: unknown; patient?: unknown }

    // Structured passthrough: validate an uploaded/pasted PatientRecord.
    if (body.patient !== undefined) {
      try {
        const patient = patientRecordSchema.parse(body.patient)
        return json({ patient, source: "structured" }, 200)
      } catch (error) {
        if (error instanceof ZodError) {
          return json(
            errorBody(
              "invalid_request",
              "Patient record failed validation. All patients must be synthetic (isSynthetic: true).",
              error.issues,
            ),
            400,
          )
        }
        throw error
      }
    }

    // Free-text intake: structure with the model, then assemble a valid synthetic record.
    if (typeof body.text === "string" && body.text.trim().length > 0) {
      const extraction = await extractIntakeFromText(body.text)
      try {
        const patient = buildPatientFromIntake(extraction.intake)
        return json(
          {
            patient,
            source: "ai-intake",
            provider: extraction.provider,
            model: extraction.model,
            fallbackUsed: extraction.fallbackUsed,
          },
          200,
        )
      } catch (error) {
        if (error instanceof ZodError) {
          return json(
            errorBody(
              "intake_incomplete",
              "Could not assemble a valid patient record from the provided text. Add more clinical detail or use the structured JSON option.",
            ),
            422,
          )
        }
        throw error
      }
    }

    return json(errorBody("invalid_request", "Provide a non-empty 'text' string or a 'patient' object."), 400)
  } catch {
    return json(errorBody("internal_error", "An unexpected error occurred while processing the intake."), 500)
  }
}
