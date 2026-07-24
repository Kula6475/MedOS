import { z } from "zod"

import { patientRecordSchema } from "./patient"

export const analyzePatientRequestSchema = z.union([
  z.object({ patientId: z.string().trim().min(1).max(100) }).strict(),
  z.object({ patient: patientRecordSchema }).strict(),
])
export type AnalyzePatientRequest = z.infer<typeof analyzePatientRequestSchema>

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(2_000),
    details: z.record(z.string(), z.unknown()).optional(),
  }).strict(),
}).strict()
export type APIErrorResponse = z.infer<typeof apiErrorResponseSchema>
