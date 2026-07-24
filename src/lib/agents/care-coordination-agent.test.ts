import { describe, expect, it } from "vitest"

import { agentResultSchema, type AgentResult } from "@/lib/schemas"
import { getPatientRecordById } from "@/data/patients"

import { careCoordinationAgent } from "./care-coordination-agent"
import { imagingReviewAgent } from "./imaging-review-agent"
import { labAnalysisAgent } from "./lab-analysis-agent"
import { medicationSafetyAgent } from "./medication-safety-agent"
import { triageAgent } from "./triage-agent"
import { createTestContext, createThrowingModelProvider } from "./test-support"

async function runSpecialists(patient: ReturnType<typeof getPatientRecordById>) {
  const context = createTestContext(patient!)
  const results = await Promise.all(
    [triageAgent, medicationSafetyAgent, labAnalysisAgent, imagingReviewAgent].map((agent) => agent.run(context)),
  )
  return { context, results }
}

describe("careCoordinationAgent", () => {
  it("returns a schema-valid result combining all specialist outputs", async () => {
    const patient = getPatientRecordById("MED-1042")
    const { context, results } = await runSpecialists(patient)

    const coordination = await careCoordinationAgent.run({ ...context, specialistResults: results })

    expect(agentResultSchema.safeParse(coordination).success).toBe(true)
    expect(coordination.evidence.length).toBeGreaterThan(0)
    expect(coordination.recommendation).toMatch(/human clinician review/i)
    expect(coordination.coordinatedPlan?.humanReviewRequired).toBe(true)
    expect(coordination.coordinatedPlan?.priorities).toHaveLength(4)
    expect(coordination.coordinatedPlan?.priorities.every((priority) => priority.evidenceRefs.length > 0)).toBe(true)
  })

  it("only cites evidence references that came from the specialist outputs", async () => {
    const patient = getPatientRecordById("MED-1042")
    const { context, results } = await runSpecialists(patient)

    const coordination = await careCoordinationAgent.run({ ...context, specialistResults: results })

    const specialistReferences = new Set(results.flatMap((result) => result.evidence.map((item) => item.reference)))
    for (const item of coordination.evidence) {
      expect(specialistReferences.has(item.reference)).toBe(true)
    }
  })

  it("notes a failed specialist as missing information instead of silently dropping it", async () => {
    const patient = getPatientRecordById("MED-1042")
    const { context, results } = await runSpecialists(patient)

    const failedLabResult: AgentResult = {
      ...results.find((result) => result.agent === "lab-analysis")!,
      status: "failed",
      evidence: [],
      possibleConcerns: [],
      missingInformation: [],
    }
    const specialistResults = results.map((result) => (result.agent === "lab-analysis" ? failedLabResult : result))

    const coordination = await careCoordinationAgent.run({ ...context, specialistResults })

    expect(coordination.missingInformation.some((item) => /Lab Analysis Agent.*unavailable/i.test(item))).toBe(true)
  })

  it("still returns a schema-valid failed result when the model call throws", async () => {
    const patient = getPatientRecordById("MED-1042")
    const { context, results } = await runSpecialists(patient)
    const throwingContext = { ...context, modelProvider: createThrowingModelProvider(), specialistResults: results }

    const coordination = await careCoordinationAgent.run(throwingContext)

    expect(agentResultSchema.safeParse(coordination).success).toBe(true)
    expect(coordination.status).toBe("failed")
  })
})
