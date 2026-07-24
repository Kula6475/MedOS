import { neon } from "@neondatabase/serverless"

// This module reads process.env and opens database connections. It is server-only and must never
// be imported into a client component.
if (typeof window !== "undefined") {
  throw new Error("db/client.ts is server-only and must not be imported into client code.")
}

export type SqlRow = Record<string, unknown>

// The minimal tagged-template surface of the Neon serverless driver that the repositories depend
// on. Depending on this interface (rather than the concrete driver) lets tests inject a fake SQL
// client without a live database.
export type Sql = <T = SqlRow>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>

export type DatabaseEnvironment = Record<string, string | undefined>

// Vercel's Neon integration exposes several connection strings; any of these enables persistence.
export function resolveDatabaseUrl(env: DatabaseEnvironment = process.env): string | undefined {
  return (
    env.DATABASE_URL?.trim() ||
    env.POSTGRES_URL?.trim() ||
    env.POSTGRES_PRISMA_URL?.trim() ||
    undefined
  )
}

// When false, the app runs entirely on the in-memory synthetic fixtures (the default demo path).
export function isDatabaseConfigured(env: DatabaseEnvironment = process.env): boolean {
  return Boolean(resolveDatabaseUrl(env))
}

let cachedSql: Sql | undefined

export function getSql(): Sql {
  const url = resolveDatabaseUrl()
  if (!url) {
    throw new Error("No database connection string is configured (set DATABASE_URL or POSTGRES_URL).")
  }
  if (!cachedSql) {
    cachedSql = neon(url) as unknown as Sql
  }
  return cachedSql
}

// Thrown when a write is requested but no database is configured, so routes can map it to a clear
// 503 instead of a generic 500.
export class DatabaseNotConfiguredError extends Error {
  readonly code = "database_not_configured"
  constructor() {
    super("Persistence is not configured. Set DATABASE_URL to enable saving records.")
    this.name = "DatabaseNotConfiguredError"
  }
}
