import { describe, expect, it } from "vitest"

import { getPatientRecordById, SHOWCASE_PATIENT_ID, syntheticPatientRecords, syntheticPatientRecordsById } from "./index"

describe("patient lookup", () => {
  it("exposes exactly the five synthetic patients", () => {
    expect(syntheticPatientRecords).toHaveLength(5)
    expect(syntheticPatientRecords.map((patient) => patient.id).sort()).toEqual(
      ["MED-1021", "MED-1029", "MED-1035", "MED-1038", "MED-1042"].sort(),
    )
  })

  it("every synthetic patient is marked isSynthetic: true", () => {
    for (const patient of syntheticPatientRecords) {
      expect(patient.isSynthetic).toBe(true)
    }
  })

  it("SHOWCASE_PATIENT_ID resolves to a real patient", () => {
    const patient = getPatientRecordById(SHOWCASE_PATIENT_ID)
    expect(patient).toBeDefined()
    expect(patient?.id).toBe(SHOWCASE_PATIENT_ID)
  })

  it("returns the correct record for a known ID", () => {
    const patient = getPatientRecordById("MED-1038")
    expect(patient?.demographics.name).toBe("Marcus Lee")
  })

  it("returns undefined for an unknown ID", () => {
    expect(getPatientRecordById("MED-9999")).toBeUndefined()
    expect(getPatientRecordById("")).toBeUndefined()
  })

  it("syntheticPatientRecordsById is keyed by patient id and stays in sync with the array", () => {
    for (const patient of syntheticPatientRecords) {
      expect(syntheticPatientRecordsById[patient.id]).toEqual(patient)
    }
  })
})
