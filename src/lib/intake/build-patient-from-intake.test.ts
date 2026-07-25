import { describe, expect, it } from "vitest"

import { patientRecordSchema, type PatientIntake } from "@/lib/schemas"

import { buildPatientFromIntake } from "./build-patient-from-intake"

const fixedNow = new Date("2026-07-24T12:00:00.000Z")

describe("buildPatientFromIntake", () => {
  it("assembles a valid synthetic record from a nearly empty intake", () => {
    const record = buildPatientFromIntake({}, { now: fixedNow })
    expect(() => patientRecordSchema.parse(record)).not.toThrow()
    expect(record.isSynthetic).toBe(true)
    expect(record.demographics.name).toBe("Synthetic Patient")
    expect(record.demographics.age).toBe(50)
    expect(record.id).toMatch(/^SYN-/)
    expect(record.demographics.medicalRecordNumber).toBe(record.id)
  })

  it("maps rich intake fields into the strict record shape", () => {
    const intake: PatientIntake = {
      name: "Test Patient",
      age: 54,
      sex: "M",
      chiefComplaint: "Chest pain",
      history: ["Hypertension", "Type 2 diabetes"],
      symptoms: [{ name: "Chest pain", detail: "Crushing, substernal", onset: "40 minutes ago" }],
      vitals: { heartRate: 104, bloodPressureSystolic: 158, bloodPressureDiastolic: 95, oxygenSaturation: 94 },
      medications: [{ name: "Lisinopril" }],
      allergies: [{ substance: "Penicillin", reaction: "Hives", severity: "moderate" }],
      labs: [{ test: "Troponin", value: "pending" }],
      imaging: [{ study: "12-lead ECG", impression: "ST elevation II, III, aVF" }],
      notes: [{ text: "EMS report" }],
    }
    const record = buildPatientFromIntake(intake, { now: fixedNow })
    expect(() => patientRecordSchema.parse(record)).not.toThrow()
    expect(record.demographics.name).toBe("Test Patient")
    expect(record.demographics.dateOfBirth).toBe("1972-01-01")
    expect(record.vitals[0].heartRate).toBe(104)
    expect(record.medications[0].dose).toBe("Not specified")
    expect(record.labs[0].value).toBe("pending")
    expect(record.imaging[0].limitations).toEqual([])
  })

  it("drops malformed entries with empty required fields", () => {
    const intake = {
      history: ["  ", "Asthma"],
      symptoms: [{ name: "  " }, { name: "Wheezing" }],
      medications: [{ name: "" }],
    } as unknown as PatientIntake
    const record = buildPatientFromIntake(intake, { now: fixedNow })
    expect(record.history).toEqual([{ condition: "Asthma" }])
    expect(record.symptoms).toHaveLength(1)
    expect(record.symptoms[0].name).toBe("Wheezing")
    expect(record.medications).toHaveLength(0)
  })
})
