import { z } from "zod"

export const agentNameSchema = z.enum([
  "triage",
  "medication-safety",
  "lab-analysis",
  "imaging-review",
  "care-coordination",
])
export type AgentName = z.infer<typeof agentNameSchema>

// Mirrors the ARCHITECTURE.md state model: idle -> queued -> processing -> evaluating -> passed|review|blocked|failed.
export const agentStatusSchema = z.enum([
  "idle",
  "queued",
  "processing",
  "evaluating",
  "passed",
  "review",
  "blocked",
  "failed",
])
export type AgentStatus = z.infer<typeof agentStatusSchema>

// Distinct from AgentStatus: this is the safety-gate outcome specifically. "not_evaluated" covers
// an agent that failed before an evaluation could run.
export const agentEvaluationStatusSchema = z.enum(["pass", "review", "blocked", "not_evaluated"])
export type AgentEvaluationStatus = z.infer<typeof agentEvaluationStatusSchema>
