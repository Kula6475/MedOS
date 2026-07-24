import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { DatabaseNotConfiguredError, createPatient, listPatients } from "@/lib/db"

export const dynamic = "force-dynamic"
const MAX_REQUEST_BYTES = 256 * 1024
const JSON_CONTENT_TYPE_PATTERN = /^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|$)/i

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } }
}

// Lists patients from the database when configured, otherwise the synthetic fixtures. Never fails
// on a missing database.
export async function GET() {
  try {
    const patients = await listPatients()
    return json({ patients, count: patients.length }, 200)
  } catch {
    return json(errorBody("internal_error", "Could not list patients."), 500)
  }
}

// Creates a synthetic patient. Requires a configured database; the record must satisfy
// patientRecordSchema, which enforces isSynthetic: true (no real patient data can be stored).
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

    const patient = await createPatient(raw)
    return json({ patient }, 201)
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return json(errorBody("database_not_configured", error.message), 503)
    }
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
    return json(errorBody("internal_error", "Could not create patient."), 500)
  }
}
