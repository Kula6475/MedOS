import { describe, expect, it } from "vitest"

import { getPatientRecordById } from "@/data/patients"

import { POST } from "./route"

function jsonRequest(body: unknown, { raw }: { raw?: string } = {}) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  })
}

describe("POST /api/analyze", () => {
  it("returns 200 with a full PatientAnalysis for a known patientId", async () => {
    const response = await POST(jsonRequest({ patientId: "MED-1042" }))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.patientId).toBe("MED-1042")
    expect(body.agents).toHaveLength(5)
    expect(typeof body.disclaimer).toBe("string")
  })

  it("returns 200 for an inline patient submission", async () => {
    const patient = getPatientRecordById("MED-1038")!
    const response = await POST(jsonRequest({ patient }))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.patientId).toBe("MED-1038")
  })

  it("returns 404 with a structured error for an unknown patientId", async () => {
    const response = await POST(jsonRequest({ patientId: "MED-9999" }))
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.error.code).toBe("patient_not_found")
    expect(body.error).not.toHaveProperty("stack")
  })

  it("returns 400 with a structured error when the request body fails validation", async () => {
    const response = await POST(jsonRequest({}))
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error.code).toBe("invalid_request")
  })

  it("returns 400 with a structured error for malformed JSON", async () => {
    const response = await POST(jsonRequest(undefined, { raw: "{not-json" }))
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error.code).toBe("invalid_json")
  })

  it("rejects a request that does not declare a JSON content type", async () => {
    const response = await POST(
      new Request("http://localhost/api/analyze", { method: "POST", body: JSON.stringify({ patientId: "MED-1042" }) }),
    )

    expect(response.status).toBe(415)
    expect((await response.json()).error.code).toBe("unsupported_media_type")
  })

  it("rejects ambiguous input containing both patientId and patient", async () => {
    const patient = getPatientRecordById("MED-1038")!
    const response = await POST(jsonRequest({ patientId: patient.id, patient }))

    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe("invalid_request")
  })

  it("rejects request bodies over the configured size limit", async () => {
    const response = await POST(jsonRequest({ patientId: "x".repeat(300_000) }))

    expect(response.status).toBe(413)
    expect((await response.json()).error.code).toBe("request_too_large")
  })

  it("marks successful and error responses as non-cacheable", async () => {
    const responses = await Promise.all([POST(jsonRequest({ patientId: "MED-1042" })), POST(jsonRequest({}))])

    expect(responses.every((response) => response.headers.get("cache-control") === "no-store")).toBe(true)
  })

  it("never leaks a stack trace in any error response", async () => {
    const responses = await Promise.all([
      POST(jsonRequest({})),
      POST(jsonRequest({ patientId: "MED-9999" })),
      POST(jsonRequest(undefined, { raw: "{not-json" })),
    ])

    for (const response of responses) {
      const text = await response.text()
      expect(text).not.toMatch(/at [A-Za-z].*\(.*:\d+:\d+\)/)
      expect(text.toLowerCase()).not.toContain("\"stack\"")
    }
  })
})
