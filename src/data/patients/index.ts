import { patientRecordSchema, type PatientRecord } from "@/lib/schemas"

import { aishaThompson } from "./aisha-thompson"
import { elenaVasquez } from "./elena-vasquez"
import { marcusLee } from "./marcus-lee"
import { robertChen } from "./robert-chen"
import { sofiaAlvarez } from "./sofia-alvarez"

export { evidenceRef, type PatientRecordSection } from "@/lib/schemas"

// MED-1042 is the golden-path showcase case per HACKATHON_PLAN.md.
export const SHOWCASE_PATIENT_ID = "MED-1042"

const rawPatientRecords = [elenaVasquez, marcusLee, aishaThompson, robertChen, sofiaAlvarez]

// Parsed (not just type-cast) so a malformed fixture fails at import time rather than reaching an agent.
export const syntheticPatientRecords: PatientRecord[] = rawPatientRecords.map((record) =>
  patientRecordSchema.parse(record),
)

export const syntheticPatientRecordsById: Record<string, PatientRecord> = Object.fromEntries(
  syntheticPatientRecords.map((record) => [record.id, record]),
)

export function getPatientRecordById(id: string): PatientRecord | undefined {
  return syntheticPatientRecordsById[id]
}
