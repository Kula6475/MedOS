import { beforeEach, describe, expect, it } from "vitest"

import { syntheticPatientRecords } from "@/data/patients"
import type { PatientAnalysis } from "@/lib/schemas"

import {
  DatabaseNotConfiguredError,
  createPatient,
  getPatient,
  isDatabaseConfigured,
  listAnalysesForPatient,
  listPatients,
  resetSchemaCacheForTests,
  resolveDatabaseUrl,
  saveAnalysis,
  type Sql,
} from "./index"

interface SqlCall {
  text: string
  params: unknown[]
}

// Builds a fake tagged-template SQL client. DDL and the seed count query are auto-answered so a
// test only needs to supply rows for the SELECT/INSERT it cares about. `rows` may throw to
// simulate a database error.
function createFakeSql(rows: (text: string, params: unknown[]) => unknown[] = () => []): {
  sql: Sql
  calls: SqlCall[]
} {
  const calls: SqlCall[] = []
  const sql = (<T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join(" ? ").replace(/\s+/g, " ").trim()
    calls.push({ text, params: values })
    const lower = text.toLowerCase()
    if (lower.includes("create table") || lower.includes("create index") || lower.startsWith("insert into")) {
      return Promise.resolve([] as T[])
    }
    if (lower.includes("select count")) {
      // Non-zero so ensureSchema skips seeding during tests.
      return Promise.resolve([{ count: 5 }] as unknown as T[])
    }
    return Promise.resolve(rows(text, values) as T[])
  }) as unknown as Sql
  return { sql, calls }
}

const sampleAnalysis = {
  analysisId: "analysis-test-1",
  patientId: "MED-1042",
  overallRisk: "critical",
} as unknown as PatientAnalysis

beforeEach(() => {
  resetSchemaCacheForTests()
})

describe("client configuration", () => {
  it("resolves a connection string from any supported env var", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "postgres://a" })).toBe("postgres://a")
    expect(resolveDatabaseUrl({ POSTGRES_URL: "postgres://b" })).toBe("postgres://b")
    expect(resolveDatabaseUrl({})).toBeUndefined()
  })

  it("reports configuration state", () => {
    expect(isDatabaseConfigured({ DATABASE_URL: "postgres://a" })).toBe(true)
    expect(isDatabaseConfigured({})).toBe(false)
  })
})

describe("patient repository", () => {
  it("returns synthetic fixtures when the database is not configured", async () => {
    const patients = await listPatients({ configured: false })
    expect(patients).toEqual(syntheticPatientRecords)
  })

  it("parses and returns database rows when configured", async () => {
    const seeded = syntheticPatientRecords[0]
    const { sql } = createFakeSql((text) =>
      text.toLowerCase().includes("select record") ? [{ record: seeded }] : [],
    )
    const patients = await listPatients({ sql, configured: true })
    expect(patients).toHaveLength(1)
    expect(patients[0].id).toBe(seeded.id)
  })

  it("falls back to fixtures when a configured database errors (golden path stays alive)", async () => {
    const { sql } = createFakeSql((text) => {
      if (text.toLowerCase().includes("select record")) throw new Error("connection refused")
      return []
    })
    const patients = await listPatients({ sql, configured: true })
    expect(patients).toEqual(syntheticPatientRecords)
  })

  it("getPatient falls back to the fixture when the row is absent", async () => {
    const { sql } = createFakeSql(() => [])
    const patient = await getPatient("MED-1042", { sql, configured: true })
    expect(patient?.id).toBe("MED-1042")
  })

  it("getPatient uses fixtures directly when not configured", async () => {
    const patient = await getPatient("MED-1042", { configured: false })
    expect(patient?.id).toBe("MED-1042")
    expect(await getPatient("does-not-exist", { configured: false })).toBeUndefined()
  })

  it("rejects a non-synthetic patient record", async () => {
    const real = { ...syntheticPatientRecords[0], isSynthetic: false }
    await expect(createPatient(real, { configured: true, sql: createFakeSql().sql })).rejects.toThrow()
  })

  it("throws DatabaseNotConfiguredError when creating without a database", async () => {
    await expect(createPatient(syntheticPatientRecords[0], { configured: false })).rejects.toBeInstanceOf(
      DatabaseNotConfiguredError,
    )
  })

  it("inserts a valid synthetic patient when configured", async () => {
    const { sql, calls } = createFakeSql()
    const created = await createPatient(syntheticPatientRecords[1], { sql, configured: true })
    expect(created.id).toBe(syntheticPatientRecords[1].id)
    expect(calls.some((call) => call.text.toLowerCase().startsWith("insert into patients"))).toBe(true)
  })
})

describe("analysis repository", () => {
  it("is a no-op when persistence is not configured", async () => {
    expect(await saveAnalysis(sampleAnalysis, { configured: false })).toBe(false)
    expect(await listAnalysesForPatient("MED-1042", { configured: false })).toEqual([])
  })

  it("persists an analysis when configured", async () => {
    const { sql, calls } = createFakeSql()
    const saved = await saveAnalysis(sampleAnalysis, { sql, configured: true })
    expect(saved).toBe(true)
    const insert = calls.find((call) => call.text.toLowerCase().startsWith("insert into analyses"))
    expect(insert).toBeDefined()
    expect(insert?.params).toContain("analysis-test-1")
    expect(insert?.params).toContain("MED-1042")
  })

  it("maps saved analysis summaries", async () => {
    const { sql } = createFakeSql((text) =>
      text.toLowerCase().includes("from analyses")
        ? [
            {
              id: "analysis-test-1",
              patient_id: "MED-1042",
              overall_risk: "critical",
              created_at: "2026-07-24T00:00:00.000Z",
            },
          ]
        : [],
    )
    const summaries = await listAnalysesForPatient("MED-1042", { sql, configured: true })
    expect(summaries).toEqual([
      {
        analysisId: "analysis-test-1",
        patientId: "MED-1042",
        overallRisk: "critical",
        createdAt: "2026-07-24T00:00:00.000Z",
      },
    ])
  })
})
