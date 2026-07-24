import { NextResponse } from "next/server"

import { getAnalysisById, listAnalysesForPatient } from "@/lib/db"

export const dynamic = "force-dynamic"

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

function errorBody(code: string, message: string) {
  return { error: { code, message } }
}

// GET /api/analyses?id=<analysisId>        -> full saved PatientAnalysis
// GET /api/analyses?patientId=<patientId>  -> summaries of that patient's saved analyses (newest first)
// Returns empty history (not an error) when persistence is not configured.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const analysisId = searchParams.get("id")
  const patientId = searchParams.get("patientId")

  try {
    if (analysisId) {
      const analysis = await getAnalysisById(analysisId)
      if (!analysis) {
        return json(errorBody("not_found", "No saved analysis found for that id."), 404)
      }
      return json({ analysis }, 200)
    }

    if (!patientId) {
      return json(errorBody("invalid_request", "Provide a patientId or id query parameter."), 400)
    }

    const analyses = await listAnalysesForPatient(patientId)
    return json({ analyses, count: analyses.length }, 200)
  } catch {
    return json(errorBody("internal_error", "Could not read saved analyses."), 500)
  }
}
