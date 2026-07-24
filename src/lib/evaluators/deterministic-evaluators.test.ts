import { describe, expect, it } from "vitest"

import { getPatientRecordById } from "@/data/patients"
import { triageAgent } from "@/lib/agents/triage-agent"
import { createTestContext } from "@/lib/agents/test-support"
import { agentResultSchema, evaluationCheckNameSchema, type AgentResult } from "@/lib/schemas"

import { evaluateAgentResult, evidenceReferenceExists } from "./deterministic-evaluators"

describe("deterministic agent evaluators", () => {
  it("runs every required check and derives confidence from the composite score", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const result = await triageAgent.run(createTestContext(patient))

    expect(result.evaluation?.checks.map((check) => check.name).sort()).toEqual(
      [...evaluationCheckNameSchema.options].sort(),
    )
    expect(result.evaluationStatus).toBe("pass")
    expect(result.status).toBe("passed")
    expect(result.confidence).toBe(result.evaluation?.compositeScore)
  })

  it("resolves only stable references that exist in the synthetic patient record", () => {
    const patient = getPatientRecordById("MED-1042")!

    expect(evidenceReferenceExists(patient, "chiefComplaint")).toBe(true)
    expect(evidenceReferenceExists(patient, "vitals.0")).toBe(true)
    expect(evidenceReferenceExists(patient, "vitals.999")).toBe(false)
    expect(evidenceReferenceExists(patient, "__proto__.0")).toBe(false)
  })

  it("blocks an otherwise schema-valid result with an unsupported evidence reference", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const original = await triageAgent.run(createTestContext(patient))
    const result = agentResultSchema.parse({
      ...original,
      evidence: [{ reference: "vitals.999", description: "Unsupported vital-sign reference.", sourceSection: "vitals" }],
      evaluation: undefined,
    })

    const evaluation = evaluateAgentResult({ patient, result })

    expect(evaluation.status).toBe("blocked")
    expect(evaluation.checks.find((check) => check.name === "evidence-grounding")?.passed).toBe(false)
  })

  it("blocks definitive diagnosis language as an unsupported and unsafe claim", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const original = await triageAgent.run(createTestContext(patient))
    const result = agentResultSchema.parse({
      ...original,
      recommendation: "You have sepsis.",
      evaluation: undefined,
    })

    const evaluation = evaluateAgentResult({ patient, result })

    expect(evaluation.status).toBe("blocked")
    expect(evaluation.checks.find((check) => check.name === "unsupported-claims")?.passed).toBe(false)
    expect(evaluation.checks.find((check) => check.name === "safety-language")?.passed).toBe(false)
  })

  it("returns a complete blocked evaluation instead of throwing on invalid output", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const original = await triageAgent.run(createTestContext(patient))
    const malformed = { ...original, summary: undefined } as unknown as AgentResult

    const evaluation = evaluateAgentResult({ patient, result: malformed })

    expect(evaluation.status).toBe("blocked")
    expect(evaluation.compositeScore).toBe(0)
    expect(evaluation.checks).toHaveLength(evaluationCheckNameSchema.options.length)
    expect(evaluation.checks[0].name).toBe("schema-validity")
    expect(evaluation.checks[0].hardFailure).toBe(true)
  })
})
