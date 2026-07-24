import { describe, expect, it } from "vitest"

import { patientAnalysisSchema } from "@/lib/schemas"
import { getPatientRecordById, syntheticPatientRecords } from "@/data/patients"
import { createModelProvider, type ModelProvider, type ModelProviderRequest } from "@/lib/providers"

import { runAnalysis } from "./analysis-orchestrator"

describe("runAnalysis", () => {
  it("returns a schema-valid PatientAnalysis for every synthetic patient", async () => {
    for (const patient of syntheticPatientRecords) {
      const result = await runAnalysis({ patientId: patient.id })

      expect(result.ok).toBe(true)
      if (!result.ok) continue
      expect(patientAnalysisSchema.safeParse(result.analysis).success).toBe(true)
      expect(result.analysis.patientId).toBe(patient.id)
      expect(result.analysis.agents).toHaveLength(5)
      expect(result.analysis.agents.every((agent) => agent.status === "passed")).toBe(true)
      expect(result.analysis.agents.every((agent) => agent.evaluationStatus === "pass")).toBe(true)
      expect(result.analysis.agents.every((agent) => agent.confidence === agent.evaluation?.compositeScore)).toBe(true)
      expect(result.analysis.coordinatedPlan?.humanReviewRequired).toBe(true)
      expect(result.analysis.agents.map((agent) => agent.agent).sort()).toEqual(
        ["care-coordination", "imaging-review", "lab-analysis", "medication-safety", "triage"].sort(),
      )
    }
  })

  it("starts all four specialist model calls before care coordination", async () => {
    const delegate = createModelProvider()
    const callOrder: string[] = []
    const recordingProvider: ModelProvider = {
      name: "mock",
      generate: async <TOutput>(request: ModelProviderRequest<TOutput>) => {
        callOrder.push(request.agent)
        return delegate.generate(request)
      },
    }

    const result = await runAnalysis({ patientId: "MED-1042", modelProvider: recordingProvider })

    expect(result.ok).toBe(true)
    expect(new Set(callOrder.slice(0, 4))).toEqual(
      new Set(["triage", "medication-safety", "lab-analysis", "imaging-review"]),
    )
    expect(callOrder[4]).toBe("care-coordination")
  })

  it("accepts an inline patient record instead of a patientId", async () => {
    const patient = getPatientRecordById("MED-1038")!
    const result = await runAnalysis({ patient })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.analysis.patientId).toBe("MED-1038")
  })

  it("returns a typed error for an unknown patient id (invalid patient)", async () => {
    const result = await runAnalysis({ patientId: "MED-9999" })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("patient_not_found")
  })

  it("returns a typed error for a malformed inline patient record (invalid patient)", async () => {
    const patient = getPatientRecordById("MED-1038")!
    const malformed = { ...patient, isSynthetic: false }
    const result = await runAnalysis({ patient: malformed as unknown as typeof patient })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("invalid_patient_record")
  })

  it("returns a typed error when neither patientId nor patient is provided (invalid request)", async () => {
    const result = await runAnalysis({})

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe("invalid_request")
  })

  it("preserves a partial failure: one specialist crashing does not fail the whole run", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const delegate = createModelProvider()
    const crashingProvider: ModelProvider = {
      name: "mock" as const,
      generate: async <TOutput>(request: ModelProviderRequest<TOutput>) => {
        if (request.agent === "lab-analysis") throw new Error("simulated crash")
        return delegate.generate(request)
      },
    }

    const result = await runAnalysis({ patientId: patient.id, modelProvider: crashingProvider })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const labResult = result.analysis.agents.find((agent) => agent.agent === "lab-analysis")
    expect(labResult?.status).toBe("failed")
    expect(labResult?.error).toBeDefined()

    const otherAgents = result.analysis.agents.filter((agent) => agent.agent !== "lab-analysis")
    expect(otherAgents.every((agent) => agent.status !== "failed")).toBe(true)

    expect(
      result.analysis.missingInformation.some((item) => /Lab Analysis Agent.*unavailable/i.test(item)),
    ).toBe(true)
  })

  it("does not expose a coordinator recommendation that the safety gate blocks", async () => {
    const delegate = createModelProvider()
    const unsafeProvider: ModelProvider = {
      name: "mock",
      generate: async <TOutput>(request: ModelProviderRequest<TOutput>) => {
        if (request.agent !== "care-coordination") return delegate.generate(request)
        const mockResponse = structuredClone(request.mockResponse) as {
          coordinatedPlan: { priorities: Array<{ action: string }> }
        }
        mockResponse.coordinatedPlan.priorities[0].action =
          "Administer treatment immediately without clinician review."
        return delegate.generate({ ...request, mockResponse: mockResponse as TOutput })
      },
    }

    const result = await runAnalysis({ patientId: "MED-1042", modelProvider: unsafeProvider })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const coordinator = result.analysis.agents.find((agent) => agent.agent === "care-coordination")
    expect(coordinator?.status).toBe("blocked")
    expect(result.analysis.finalRecommendation).toMatch(/did not pass the deterministic safety gate/i)
    expect(result.analysis.finalRecommendation).not.toMatch(/administer treatment/i)
    expect(result.analysis.coordinatedPlan).toBeUndefined()
  })
})
