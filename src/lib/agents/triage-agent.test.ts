import { describe, expect, it } from "vitest"

import { agentResultSchema } from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { triageAgent } from "./triage-agent"
import { createTestContext, createThrowingModelProvider } from "./test-support"

// Deliberately excludes bare "confirmed diagnosis" — the agent's own cautious-language disclaimer
// legitimately says "not a confirmed diagnosis", which must not trip this check.
const PROHIBITED_LANGUAGE = /\bconfirmed diagnosis of\b|\bdiagnosed with\b|\byou have\b/i

describe("triageAgent", () => {
  it("returns a schema-valid result for the critical showcase patient", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await triageAgent.run(createTestContext(patient))

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.agent).toBe("triage")
    expect(result.fallbackUsed).toBe(true)
    expect(result.provider).toBe("mock")
    expect(result.evidence.length).toBeGreaterThan(0)
    expect(result.possibleConcerns.length).toBeGreaterThan(0)
  })

  it("flags multiple risk concerns for a patient with unstable vitals", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await triageAgent.run(createTestContext(patient))

    expect(result.possibleConcerns.some((concern) => /shock|hypotension|blood pressure/i.test(concern))).toBe(true)
  })

  it("never uses confirmed-diagnosis language", async () => {
    for (const patient of [getPatientRecordById("MED-1042")!, getPatientRecordById("MED-1038")!]) {
      const result = await triageAgent.run(createTestContext(patient))
      expect(result.summary).not.toMatch(PROHIBITED_LANGUAGE)
      expect(result.recommendation).not.toMatch(PROHIBITED_LANGUAGE)
    }
  })

  it("cites evidence using exact patient-record field paths", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await triageAgent.run(createTestContext(patient))

    const references = result.evidence.map((item) => item.reference)
    expect(references).toContain("chiefComplaint")
    expect(references.some((ref) => ref.startsWith("vitals."))).toBe(true)
    expect(references.some((ref) => ref.startsWith("symptoms."))).toBe(true)
  })

  it("still returns a schema-valid failed result when the model call throws", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const context = createTestContext(patient, { modelProvider: createThrowingModelProvider() })
    const result = await triageAgent.run(context)

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.status).toBe("failed")
    expect(result.error?.message).toBe("simulated model failure")
  })
})
