import { describe, expect, it } from "vitest"

import { patientRecordSchema, type PatientRecord } from "./patient"

function validRecord(): PatientRecord {
  return {
    id: "TEST-0001",
    isSynthetic: true,
    demographics: {
      name: "Test Patient",
      age: 40,
      sex: "F",
      dateOfBirth: "1986-01-01",
      medicalRecordNumber: "TEST-0001",
    },
    chiefComplaint: "Test complaint",
    arrivalAt: "2025-01-01T00:00:00Z",
    history: [{ condition: "Hypertension" }],
    symptoms: [{ name: "Headache", detail: "Mild, frontal", onset: "1 hour" }],
    vitals: [
      {
        recordedAt: "2025-01-01T00:05:00Z",
        heartRate: 80,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        temperatureCelsius: 37.0,
        abnormalFlags: [],
      },
    ],
    medications: [{ name: "Lisinopril", dose: "10 mg", route: "PO", schedule: "Daily", status: "Active" }],
    allergies: [{ substance: "Penicillin", reaction: "Rash", severity: "moderate" }],
    labs: [
      {
        test: "Sodium",
        value: "140",
        unit: "mmol/L",
        referenceRange: "135-145",
        abnormal: false,
        critical: false,
        collectedAt: "2025-01-01T00:10:00Z",
      },
    ],
    imaging: [
      {
        study: "Chest radiograph",
        performedAt: "2025-01-01T00:15:00Z",
        impression: "No acute findings.",
        findings: "Clear lungs.",
        limitations: [],
      },
    ],
    notes: [{ author: "Dr. Test", role: "Emergency medicine", recordedAt: "2025-01-01T00:20:00Z", text: "Stable." }],
    timeline: [{ occurredAt: "2025-01-01T00:00:00Z", title: "Arrival", detail: "Arrived.", severity: "info" }],
  }
}

describe("patientRecordSchema", () => {
  it("accepts a well-formed synthetic patient record", () => {
    const result = patientRecordSchema.safeParse(validRecord())
    expect(result.success).toBe(true)
  })

  it("rejects isSynthetic: false", () => {
    const record = { ...validRecord(), isSynthetic: false }
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(false)
  })

  it("rejects a record missing a required field", () => {
    const record = validRecord() as Record<string, unknown>
    delete record.chiefComplaint
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(false)
  })

  it("rejects unknown fields instead of silently accepting them", () => {
    const record = { ...validRecord(), realPatientIdentifier: "must-not-be-accepted" }
    expect(patientRecordSchema.safeParse(record).success).toBe(false)
  })

  it("rejects malformed encounter timestamps", () => {
    const record = { ...validRecord(), arrivalAt: "yesterday" }
    expect(patientRecordSchema.safeParse(record).success).toBe(false)
  })

  it("rejects an invalid sex value", () => {
    const record = validRecord()
    // @ts-expect-error intentionally invalid for the test
    record.demographics.sex = "X"
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(false)
  })

  it("rejects an allergy with an invalid severity", () => {
    const record = validRecord()
    // @ts-expect-error intentionally invalid for the test
    record.allergies[0].severity = "extreme"
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(false)
  })

  it("rejects a lab result missing required fields", () => {
    const record = validRecord() as unknown as { labs: Record<string, unknown>[] }
    delete record.labs[0].referenceRange
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(false)
  })

  it("accepts empty history/symptoms/vitals/labs/imaging/notes/timeline arrays", () => {
    const record = {
      ...validRecord(),
      history: [],
      symptoms: [],
      vitals: [],
      labs: [],
      imaging: [],
      notes: [],
      timeline: [],
    }
    const result = patientRecordSchema.safeParse(record)
    expect(result.success).toBe(true)
  })
})
