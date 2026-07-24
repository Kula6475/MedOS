# MedOS Frontend API Guide

This document describes the contract between the MedOS frontend and backend. The backend supports deterministic mock inference, server-only Fireworks AI inference with deterministic fallback, and optional server-only Braintrust tracing with local observability fallback.

All patient data accepted or returned by these endpoints must be synthetic. MedOS output is clinical decision support for a hackathon demonstration; it is not a confirmed diagnosis, medical advice, or a substitute for clinician judgment.

> **Fireworks powers the intelligence; Braintrust builds trust.**

## Endpoints

### `GET /api/health`

Returns backend availability and the selected provider modes.

```json
{
  "status": "ok",
  "service": "medos-backend",
  "timestamp": "2026-07-24T18:00:00.000Z",
  "modelProvider": "mock",
  "observabilityProvider": "local"
}
```

The timestamp is generated for each request. Provider values describe the server configuration and never include credentials.

### `POST /api/analyze`

Runs the four specialist agents concurrently, evaluates each result, then runs and evaluates the Care Coordination Agent.

Set `Content-Type: application/json` and provide exactly one of these bodies:

```json
{ "patientId": "MED-1042" }
```

or a complete inline record conforming to `patientRecordSchema`:

```json
{
  "patient": {
    "id": "SYNTHETIC-1001",
    "isSynthetic": true,
    "demographics": {
      "name": "Synthetic Patient",
      "age": 40,
      "sex": "F",
      "dateOfBirth": "1986-01-01",
      "medicalRecordNumber": "SYNTHETIC-1001"
    },
    "chiefComplaint": "...",
    "arrivalAt": "2026-07-24T18:00:00Z",
    "history": [],
    "symptoms": [],
    "vitals": [],
    "medications": [],
    "allergies": [],
    "labs": [],
    "imaging": [],
    "notes": [],
    "timeline": []
  }
}
```

Use a registered `patientId` for the demo. Inline records are supported for testing and must include the full validated demographics object and all required fields. A payload containing both `patientId` and `patient` is rejected.

Example client call:

```ts
const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ patientId: "MED-1042" }),
})

const body: PatientAnalysis | APIErrorResponse = await response.json()
if (!response.ok) {
  throw new Error("error" in body ? body.error.message : "Analysis failed")
}
```

Successful and error responses include `Cache-Control: no-store`.

## Successful analysis response

The successful response is a `PatientAnalysis`:

```ts
type PatientAnalysis = {
  analysisId: string
  patientId: string
  overallRisk: "critical" | "high" | "moderate" | "low"
  agents: AgentResult[]
  finalRecommendation: string
  coordinatedPlan?: {
    situationSummary: string
    priorities: Array<{
      priority: "urgent" | "next" | "monitor"
      action: string
      rationale: string
      evidenceRefs: string[]
      responsibleRole: "physician" | "nurse" | "pharmacist" | "care-team"
    }>
    unresolvedRisks: string[]
    humanReviewRequired: true
  }
  immediateActions: string[]
  safetyWarnings: string[]
  missingInformation: string[]
  fireworksMetadata: {
    primaryModel: string
    promptVersion: string
  }
  braintrustMetadata: {
    projectName: string
    traceId?: string
    traceUrl?: string
    evaluation?: BraintrustEvaluation
    onlineScoringEnabled?: boolean
  }
  startedAt: string
  completedAt: string
  totalLatencyMs: number
  disclaimer: string
}
```

`totalLatencyMs` represents the concurrent critical path: the slowest specialist latency plus the coordinator latency. In mock mode these values are deterministic simulated latencies.

### Live and fallback inference

`GET /api/health` reports the selected server mode. When `modelProvider` is `fireworks`, the backend attempts Fireworks for each agent. This does not guarantee that every individual result used live inference.

Inspect each `AgentResult`:

- `provider: "fireworks"` and `fallbackUsed: false` means the response came from live Fireworks inference.
- `provider: "mock"` and `fallbackUsed: true` means deterministic fallback was used.
- Mock-only mode also returns `provider: "mock"` and `fallbackUsed: true`; the health response distinguishes mock-only configuration from Fireworks-with-fallback configuration.

Never label a fallback result as live inference. The deterministic evaluator pipeline runs identically for both providers.

## Agent results

The `agents` array always uses this order:

1. Triage Agent
2. Medication Safety Agent
3. Lab Analysis Agent
4. Imaging Review Agent
5. Care Coordination Agent

Each result includes:

```ts
type AgentResult = {
  agent: "triage" | "medication-safety" | "lab-analysis" | "imaging-review" | "care-coordination"
  displayName: string
  status: "passed" | "review" | "blocked" | "failed"
  summary: string
  recommendation: string
  evidence: Array<{
    reference: string
    description: string
    sourceSection?: string
  }>
  possibleConcerns: string[]
  missingInformation: string[]
  confidence: number
  latencyMs: number
  model: string
  provider: "mock" | "fireworks"
  fallbackUsed: boolean
  evaluationStatus: "pass" | "review" | "blocked" | "not_evaluated"
  evaluation?: BraintrustEvaluation
  traceId?: string
  traceUrl?: string
  error?: { code: string; message: string; retryable: boolean }
}
```

`confidence` is the deterministic composite evaluation score. It is not model self-reporting.

### Evaluation data

Every successful agent has eight deterministic checks:

- schema validity
- evidence grounding
- unsupported claims
- safety language
- completeness
- role compliance
- coordinator consistency
- latency

The evaluation also contains weighted scores for evidence grounding, safety compliance, critical-finding coverage, completeness, and cross-agent consistency. Status gates are:

- `pass`: score 85–100 with no hard failure
- `review`: score 70–84 with no hard failure
- `blocked`: score below 70 or any hard failure

A failed agent has `evaluationStatus: "not_evaluated"`. The remaining agents and coordinator still complete, and the unavailable agent is listed under `missingInformation`.

### Frontend status mapping

`POST /api/analyze` returns the completed run; Milestone 1 does not provide a progress stream. The frontend may show `Pending` and `Running` while awaiting the request, then map the final backend result as follows:

| Backend state | UI state |
| --- | --- |
| Request not started | Pending |
| Request in flight | Running |
| Final result being applied | Evaluating |
| `passed` | Complete / Pass |
| `review` | Complete / Review |
| `blocked` | Complete / Blocked |
| `failed` | Failed |

Do not animate a blocked or failed result as successful. A later streaming milestone can replace the request-level approximation with real backend progress events.

## Error responses

Errors always use this shape and never include a stack trace:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Request body failed validation.",
    "details": {}
  }
}
```

| Status | Code | Meaning |
| --- | --- | --- |
| `400` | `invalid_json` | Missing or malformed JSON body |
| `400` | `invalid_request` | Request does not match exactly one accepted input shape |
| `400` | `invalid_patient_record` | Inline synthetic record failed validation |
| `404` | `patient_not_found` | No registered synthetic fixture has that ID |
| `413` | `request_too_large` | Request exceeds 256 KiB |
| `415` | `unsupported_media_type` | Content type is not JSON |
| `500` | `coordination_failed` or `internal_error` | Unexpected server-side failure |

## Safety and rendering rules

- Always display the response `disclaimer` with recommendations.
- Label patient records and analysis output as synthetic.
- Treat `review` as requiring explicit clinician review.
- Do not display a `blocked` result as an approved recommendation.
- Prefer evidence `reference` values as stable lookup keys; never parse clinical meaning from the display text.
- Treat `traceUrl` as optional. Braintrust mode may return a hosted trace link after SDK link creation; local mode and degraded hosted logging provide a trace ID without requiring a URL.
- Never send API keys from frontend code or expose them through `NEXT_PUBLIC_*` variables.
