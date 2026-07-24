import { z } from "zod"

export const carePrioritySchema = z.enum(["urgent", "next", "monitor"])
export type CarePriority = z.infer<typeof carePrioritySchema>

export const responsibleClinicalRoleSchema = z.enum(["physician", "nurse", "pharmacist", "care-team"])
export type ResponsibleClinicalRole = z.infer<typeof responsibleClinicalRoleSchema>

export const coordinatedActionSchema = z.object({
  priority: carePrioritySchema,
  action: z.string().trim().min(1).max(4_000),
  rationale: z.string().trim().min(1).max(4_000),
  evidenceRefs: z.array(z.string().trim().min(1).max(200)).max(100),
  responsibleRole: responsibleClinicalRoleSchema,
}).strict()
export type CoordinatedAction = z.infer<typeof coordinatedActionSchema>

export const coordinatedPlanSchema = z.object({
  situationSummary: z.string().trim().min(1).max(8_000),
  priorities: z.array(coordinatedActionSchema).max(100),
  unresolvedRisks: z.array(z.string().trim().min(1).max(4_000)).max(200),
  humanReviewRequired: z.literal(true),
}).strict()
export type CoordinatedPlan = z.infer<typeof coordinatedPlanSchema>
