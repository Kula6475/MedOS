import { describe, expect, it } from "vitest"

import { getPatientRecordById } from "@/data/patients"
import { createTestContext } from "@/lib/agents/test-support"
import { triageAgent } from "@/lib/agents/triage-agent"

import { buildCareCoordinationPrompt, buildMedicationSafetyPrompt, buildTriagePrompt } from "./index"

describe("secure agent prompts", () => {
  it("limits triage context to triage-owned evidence", () => {
    const patient = getPatientRecordById("MED-1042")!
    const prompt = buildTriagePrompt(patient)

    expect(prompt.userPrompt).toContain('"chiefComplaint"')
    expect(prompt.userPrompt).toContain('"vitals"')
    expect(prompt.userPrompt).not.toContain('"medications"')
    expect(prompt.userPrompt).not.toContain('"allergies"')
    expect(prompt.systemPrompt).toMatch(/not medical advice/i)
  })

  it("includes stable references in medication context", () => {
    const patient = getPatientRecordById("MED-1042")!
    const prompt = buildMedicationSafetyPrompt(patient)

    expect(prompt.userPrompt).toContain('"reference":"medications.0"')
    expect(prompt.userPrompt).toContain('"reference":"allergies.0"')
    expect(prompt.userPrompt).not.toContain('"notes"')
  })

  it("gives the coordinator specialist output rather than the full patient record", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const triage = await triageAgent.run(createTestContext(patient))
    const prompt = buildCareCoordinationPrompt(patient.id, [triage])

    expect(prompt.userPrompt).toContain('"specialists"')
    expect(prompt.userPrompt).toContain('"agent":"triage"')
    expect(prompt.userPrompt).toContain('"evidenceRefs"')
    expect(prompt.userPrompt).toContain('"evidence"')
    expect(prompt.userPrompt).not.toContain('"displayName"')
    expect(prompt.userPrompt).not.toContain('"confidence"')
    expect(prompt.userPrompt).not.toContain('"evaluationStatus"')
    expect(prompt.userPrompt).not.toContain('"demographics"')
    expect(prompt.userPrompt).not.toContain('"bloodPressureSystolic"')
    expect(prompt.systemPrompt).toMatch(/humanReviewRequired to true/i)
    expect(prompt.systemPrompt.length).toBeLessThan(700)
    expect(prompt.userPrompt.length).toBeLessThan(8_000)
  })
})
