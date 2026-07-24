import { patientAnalysisSchema, type OverallRisk, type PatientAnalysis } from "@/lib/schemas"

import { getSql, isDatabaseConfigured, type Sql } from "./client"
import { ensureSchema } from "./schema"

export interface AnalysisRepositoryDeps {
  sql?: Sql
  configured?: boolean
}

export interface AnalysisSummary {
  analysisId: string
  patientId: string
  overallRisk: OverallRisk
  createdAt: string
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

// Best-effort: the caller wraps this so a storage failure never breaks the analysis response.
// Returns whether a row was written so tests and callers can assert behavior. No-op (false) when
// persistence is not configured.
export async function saveAnalysis(
  analysis: PatientAnalysis,
  deps: AnalysisRepositoryDeps = {},
): Promise<boolean> {
  if (!(deps.configured ?? isDatabaseConfigured())) return false
  const sql = deps.sql ?? getSql()
  await ensureSchema(sql)
  await sql`
    INSERT INTO analyses (id, patient_id, overall_risk, analysis)
    VALUES (
      ${analysis.analysisId},
      ${analysis.patientId},
      ${analysis.overallRisk},
      ${JSON.stringify(analysis)}::jsonb
    )
    ON CONFLICT (id) DO NOTHING
  `
  return true
}

export async function listAnalysesForPatient(
  patientId: string,
  deps: AnalysisRepositoryDeps = {},
): Promise<AnalysisSummary[]> {
  if (!(deps.configured ?? isDatabaseConfigured())) return []
  const sql = deps.sql ?? getSql()
  await ensureSchema(sql)
  const rows = await sql<{
    id: string
    patient_id: string
    overall_risk: OverallRisk
    created_at: unknown
  }>`
    SELECT id, patient_id, overall_risk, created_at
    FROM analyses
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return rows.map((row) => ({
    analysisId: row.id,
    patientId: row.patient_id,
    overallRisk: row.overall_risk,
    createdAt: toIsoString(row.created_at),
  }))
}

export async function getAnalysisById(
  id: string,
  deps: AnalysisRepositoryDeps = {},
): Promise<PatientAnalysis | undefined> {
  if (!(deps.configured ?? isDatabaseConfigured())) return undefined
  const sql = deps.sql ?? getSql()
  await ensureSchema(sql)
  const rows = await sql<{ analysis: unknown }>`SELECT analysis FROM analyses WHERE id = ${id} LIMIT 1`
  if (rows.length === 0) return undefined
  // Re-validated on read so a corrupt row surfaces as an error instead of reaching the UI.
  return patientAnalysisSchema.parse(rows[0].analysis)
}
