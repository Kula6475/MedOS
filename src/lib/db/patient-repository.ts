import { getPatientRecordById, syntheticPatientRecords } from "@/data/patients"
import { patientRecordSchema, type PatientRecord } from "@/lib/schemas"

import { DatabaseNotConfiguredError, getSql, isDatabaseConfigured, type Sql } from "./client"
import { ensureSchema } from "./schema"

export interface PatientRepositoryDeps {
  sql?: Sql
  configured?: boolean
}

// Reads are resilient by design: if the database is unset OR errors, we return the synthetic
// fixtures so a misconfigured or unreachable DATABASE_URL can never break the demo golden path.
function warnAndFallback(operation: string, error: unknown): void {
  const reason = error instanceof Error ? error.message : String(error)
  console.warn(`[db] patient ${operation} failed; using synthetic fixtures instead: ${reason}`)
}

export async function listPatients(deps: PatientRepositoryDeps = {}): Promise<PatientRecord[]> {
  if (!(deps.configured ?? isDatabaseConfigured())) return syntheticPatientRecords
  const sql = deps.sql ?? getSql()
  try {
    await ensureSchema(sql)
    const rows = await sql<{ record: unknown }>`SELECT record FROM patients ORDER BY created_at ASC, id ASC`
    return rows.map((row) => patientRecordSchema.parse(row.record))
  } catch (error) {
    warnAndFallback("list", error)
    return syntheticPatientRecords
  }
}

export async function getPatient(
  id: string,
  deps: PatientRepositoryDeps = {},
): Promise<PatientRecord | undefined> {
  if (!(deps.configured ?? isDatabaseConfigured())) return getPatientRecordById(id)
  const sql = deps.sql ?? getSql()
  try {
    await ensureSchema(sql)
    const rows = await sql<{ record: unknown }>`SELECT record FROM patients WHERE id = ${id} LIMIT 1`
    if (rows.length === 0) return getPatientRecordById(id)
    return patientRecordSchema.parse(rows[0].record)
  } catch (error) {
    warnAndFallback("get", error)
    return getPatientRecordById(id)
  }
}

// Writes surface their errors. Zod enforces isSynthetic: literal(true), so a real patient record
// can never be persisted; invalid input throws a ZodError the route maps to a 400.
export async function createPatient(
  input: unknown,
  deps: PatientRepositoryDeps = {},
): Promise<PatientRecord> {
  const record = patientRecordSchema.parse(input)
  if (!(deps.configured ?? isDatabaseConfigured())) throw new DatabaseNotConfiguredError()
  const sql = deps.sql ?? getSql()
  await ensureSchema(sql)
  await sql`
    INSERT INTO patients (id, record, is_synthetic)
    VALUES (${record.id}, ${JSON.stringify(record)}::jsonb, true)
    ON CONFLICT (id) DO UPDATE SET record = EXCLUDED.record
  `
  return record
}
