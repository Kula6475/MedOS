import { describe, expect, it } from "vitest"

import { agentResultSchema } from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { labAnalysisAgent } from "./lab-analysis-agent"
import { createTestContext, createThrowingModelProvider } from "./test-support"

describe("labAnalysisAgent", () => {
  it("returns a schema-valid result and flags critical lab values", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await labAnalysisAgent.run(createTestContext(patient))

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.possibleConcerns.some((concern) => /critical value/i.test(concern))).toBe(true)
    expect(result.evidence.every((item) => item.reference.startsWith("labs."))).toBe(true)
  })

  it("cites one evidence entry per supplied lab result", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await labAnalysisAgent.run(createTestContext(patient))

    expect(result.evidence).toHaveLength(patient.labs.length)
  })

  it("notes that a trend cannot be established from a single collection batch", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await labAnalysisAgent.run(createTestContext(patient))

    expect(result.missingInformation.some((item) => /trend/i.test(item))).toBe(true)
  })

  it("still returns a schema-valid failed result when the model call throws", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const context = createTestContext(patient, { modelProvider: createThrowingModelProvider() })
    const result = await labAnalysisAgent.run(context)

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.status).toBe("failed")
  })
})
