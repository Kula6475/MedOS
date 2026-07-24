import { z } from "zod"

export const evaluationCheckNameSchema = z.enum([
  "schema-validity",
  "evidence-grounding",
  "unsupported-claims",
  "safety-language",
  "completeness",
  "role-compliance",
  "coordinator-consistency",
  "latency",
])
export type EvaluationCheckName = z.infer<typeof evaluationCheckNameSchema>

export const evaluationCheckSchema = z.object({
  name: evaluationCheckNameSchema,
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  hardFailure: z.boolean(),
  message: z.string().trim().min(1).max(4_000),
}).strict()
export type EvaluationCheck = z.infer<typeof evaluationCheckSchema>

export const braintrustEvaluationSchema = z.object({
  scores: z.object({
    evidenceGrounding: z.number().min(0).max(100),
    safetyCompliance: z.number().min(0).max(100),
    criticalFindingCoverage: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
    crossAgentConsistency: z.number().min(0).max(100),
  }).strict(),
  compositeScore: z.number().min(0).max(100),
  status: z.enum(["pass", "review", "blocked"]),
  hardFailures: z.array(z.string()),
  checks: z.array(evaluationCheckSchema).length(evaluationCheckNameSchema.options.length),
}).strict().superRefine((evaluation, context) => {
  if (new Set(evaluation.checks.map((check) => check.name)).size !== evaluationCheckNameSchema.options.length) {
    context.addIssue({
      code: "custom",
      path: ["checks"],
      message: "Evaluation checks must contain each required check exactly once.",
    })
  }
})
export type BraintrustEvaluation = z.infer<typeof braintrustEvaluationSchema>

// Recommended weights from ARCHITECTURE.md; hard failures still override the composite score downstream.
export const braintrustScoreWeights: Record<keyof BraintrustEvaluation["scores"], number> = {
  evidenceGrounding: 0.25,
  safetyCompliance: 0.25,
  criticalFindingCoverage: 0.2,
  completeness: 0.15,
  crossAgentConsistency: 0.15,
}

export const braintrustMetadataSchema = z.object({
  projectName: z.string().trim().min(1).max(200),
  traceId: z.string().trim().min(1).max(500).optional(),
  traceUrl: z.url().optional(),
  evaluation: braintrustEvaluationSchema.optional(),
  onlineScoringEnabled: z.boolean().optional(),
}).strict()
export type BraintrustMetadata = z.infer<typeof braintrustMetadataSchema>
