import { NextResponse } from "next/server"

import { isDatabaseConfigured } from "@/lib/db"
import { resolveModelProviderMode, resolveObservabilityProviderMode } from "@/lib/providers"

// Evaluated per-request, not frozen at build time, so the timestamp is always current.
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "medos-backend",
    timestamp: new Date().toISOString(),
    modelProvider: resolveModelProviderMode(),
    observabilityProvider: resolveObservabilityProviderMode(),
    persistence: isDatabaseConfigured() ? "postgres" : "in-memory",
  })
}
