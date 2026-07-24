import { describe, expect, it } from "vitest"

import { agentResultSchema } from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { medicationSafetyAgent } from "./medication-safety-agent"
import { createTestContext, createThrowingModelProvider } from "./test-support"

describe("medicationSafetyAgent", () => {
  it("returns a schema-valid result and flags the documented severe allergy", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await medicationSafetyAgent.run(createTestContext(patient))

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.fallbackUsed).toBe(true)
    expect(result.possibleConcerns.some((concern) => /severe allerg/i.test(concern))).toBe(true)
    expect(result.evidence.some((item) => item.reference.startsWith("allergies."))).toBe(true)
  })

  it("does not flag a severe-allergy concern for a patient with no documented allergies", async () => {
    const patient = getPatientRecordById("MED-1038")!
    const result = await medicationSafetyAgent.run(createTestContext(patient))

    expect(result.possibleConcerns.some((concern) => /severe allerg/i.test(concern))).toBe(false)
  })

  it("cites medication and allergy evidence using exact field paths", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await medicationSafetyAgent.run(createTestContext(patient))

    const references = result.evidence.map((item) => item.reference)
    expect(references.some((ref) => ref.startsWith("medications."))).toBe(true)
    expect(references.some((ref) => ref.startsWith("allergies."))).toBe(true)
  })

  it("still returns a schema-valid failed result when the model call throws", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const context = createTestContext(patient, { modelProvider: createThrowingModelProvider() })
    const result = await medicationSafetyAgent.run(context)

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.status).toBe("failed")
  })
})
