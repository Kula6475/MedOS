import { z } from "zod"

import { agentResultSchema } from "./agent-result"
import { braintrustMetadataSchema } from "./braintrust"
import { coordinatedPlanSchema } from "./care-plan"
import { fireworksMetadataSchema } from "./fireworks"

export const overallRiskSchema = z.enum(["critical", "high", "moderate", "low"])
export type OverallRisk = z.infer<typeof overallRiskSchema>

export const MEDOS_DISCLAIMER =
  "This analysis is synthetic clinical decision support generated for demonstration purposes. It is not a confirmed diagnosis, medical advice, or a substitute for clinical judgment. A licensed clinician must review all recommendations before any action is taken."

// disclaimer is a literal (not a plain string) so every PatientAnalysis is forced to carry the
// exact required safety statement rather than a paraphrase.
export const patientAnalysisSchema = z.object({
  analysisId: z.string().trim().min(1).max(200),
  patientId: z.string().trim().min(1).max(100),
  overallRisk: overallRiskSchema,
  agents: z.array(agentResultSchema),
  finalRecommendation: z.string().trim().min(1).max(12_000),
  coordinatedPlan: coordinatedPlanSchema.optional(),
  immediateActions: z.array(z.string().trim().min(1).max(4_000)).max(100),
  safetyWarnings: z.array(z.string().trim().min(1).max(4_000)).max(100),
  missingInformation: z.array(z.string().trim().min(1).max(4_000)).max(100),
  fireworksMetadata: fireworksMetadataSchema,
  braintrustMetadata: braintrustMetadataSchema,
  startedAt: z.iso.datetime({ offset: true }),
  completedAt: z.iso.datetime({ offset: true }),
  totalLatencyMs: z.number().nonnegative(),
  disclaimer: z.literal(MEDOS_DISCLAIMER),
}).strict()
export type PatientAnalysis = z.infer<typeof patientAnalysisSchema>
