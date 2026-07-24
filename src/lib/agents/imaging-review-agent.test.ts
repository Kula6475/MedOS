import { describe, expect, it } from "vitest"

import { agentResultSchema } from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { imagingReviewAgent } from "./imaging-review-agent"
import { createTestContext, createThrowingModelProvider } from "./test-support"

describe("imagingReviewAgent", () => {
  it("returns a schema-valid result summarizing the written report", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await imagingReviewAgent.run(createTestContext(patient))

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.evidence.some((item) => item.reference.startsWith("imaging."))).toBe(true)
  })

  it("never claims to have directly inspected an image", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await imagingReviewAgent.run(createTestContext(patient))

    expect(result.summary).toMatch(/report text only/i)
    expect(result.summary).not.toMatch(/I (viewed|examined|looked at) the (image|scan|x-ray)/i)
  })

  it("treats a pending impression as missing information rather than a finding", async () => {
    const patient = getPatientRecordById("MED-1035")!
    const result = await imagingReviewAgent.run(createTestContext(patient))

    expect(result.missingInformation.some((item) => /pending/i.test(item))).toBe(true)
  })

  it("still returns a schema-valid failed result when the model call throws", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const context = createTestContext(patient, { modelProvider: createThrowingModelProvider() })
    const result = await imagingReviewAgent.run(context)

    expect(agentResultSchema.safeParse(result).success).toBe(true)
    expect(result.status).toBe("failed")
  })
})
