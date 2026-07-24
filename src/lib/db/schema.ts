import { syntheticPatientRecords } from "@/data/patients"

import type { Sql } from "./client"

let schemaReady: Promise<void> | undefined

// Idempotent and safe to call on every request. `CREATE TABLE IF NOT EXISTS` plus a one-time seed
// of the synthetic patients lets a freshly provisioned Neon database initialize itself with no
// separate migration step. Memoized per process so the DDL runs at most once per warm instance; a
// failure clears the memo so the next request can retry rather than caching a rejected promise.
export function ensureSchema(sql: Sql): Promise<void> {
  if (!schemaReady) {
    schemaReady = initializeSchema(sql).catch((error) => {
      schemaReady = undefined
      throw error
    })
  }
  return schemaReady
}

async function initializeSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id text PRIMARY KEY,
      record jsonb NOT NULL,
      is_synthetic boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id text PRIMARY KEY,
      patient_id text NOT NULL,
      overall_risk text NOT NULL,
      analysis jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS analyses_patient_created_idx
      ON analyses (patient_id, created_at DESC)
  `
  await seedSyntheticPatients(sql)
}

// Only seeds when the table is empty, so it never clobbers patients added at runtime.
async function seedSyntheticPatients(sql: Sql): Promise<void> {
  const counts = await sql<{ count: number }>`SELECT count(*)::int AS count FROM patients`
  if (Number(counts[0]?.count ?? 0) > 0) return
  for (const record of syntheticPatientRecords) {
    await sql`
      INSERT INTO patients (id, record, is_synthetic)
      VALUES (${record.id}, ${JSON.stringify(record)}::jsonb, true)
      ON CONFLICT (id) DO NOTHING
    `
  }
}

// Test-only: clears the memoized schema promise between cases.
export function resetSchemaCacheForTests(): void {
  schemaReady = undefined
}
