import { z } from "zod"

import { agentEvaluationStatusSchema, agentNameSchema, agentStatusSchema } from "./agent"
import { braintrustEvaluationSchema } from "./braintrust"
import { coordinatedPlanSchema } from "./care-plan"
import { patientRecordSectionSchema } from "./evidence-ref"

export const agentEvidenceSchema = z.object({
  reference: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4_000),
  sourceSection: patientRecordSectionSchema.optional(),
}).strict()
export type AgentEvidence = z.infer<typeof agentEvidenceSchema>

export const agentErrorSchema = z.object({
  code: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(2_000),
  retryable: z.boolean(),
}).strict()
export type AgentError = z.infer<typeof agentErrorSchema>

// traceId/traceUrl are optional: only populated once Braintrust tracing is wired in.
export const agentResultSchema = z.object({
  agent: agentNameSchema,
  displayName: z.string().trim().min(1).max(200),
  status: agentStatusSchema,
  summary: z.string().trim().min(1).max(8_000),
  recommendation: z.string().trim().min(1).max(8_000),
  evidence: z.array(agentEvidenceSchema),
  possibleConcerns: z.array(z.string().trim().min(1).max(4_000)).max(100),
  missingInformation: z.array(z.string().trim().min(1).max(4_000)).max(100),
  confidence: z.number().min(0).max(100),
  latencyMs: z.number().nonnegative(),
  model: z.string().trim().min(1).max(200),
  provider: z.enum(["fireworks", "mock"]),
  fallbackUsed: z.boolean(),
  evaluationStatus: agentEvaluationStatusSchema,
  evaluation: braintrustEvaluationSchema.optional(),
  coordinatedPlan: coordinatedPlanSchema.optional(),
  traceId: z.string().trim().min(1).max(500).optional(),
  traceUrl: z.url().optional(),
  error: agentErrorSchema.optional(),
}).strict().superRefine((result, context) => {
  const requiresPlan = result.agent === "care-coordination" && result.status !== "failed"
  if (requiresPlan && !result.coordinatedPlan) {
    context.addIssue({
      code: "custom",
      path: ["coordinatedPlan"],
      message: "A non-failed Care Coordination Agent result requires a structured coordinated plan.",
    })
  }
  if (result.agent !== "care-coordination" && result.coordinatedPlan) {
    context.addIssue({
      code: "custom",
      path: ["coordinatedPlan"],
      message: "Only the Care Coordination Agent may return a coordinated plan.",
    })
  }
})
export type AgentResult = z.infer<typeof agentResultSchema>
