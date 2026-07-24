import { z } from "zod"

export const fireworksMetadataSchema = z.object({
  primaryModel: z.string().trim().min(1).max(200),
  promptVersion: z.string().trim().min(1).max(200),
  totalPromptTokens: z.number().nonnegative().optional(),
  totalCompletionTokens: z.number().nonnegative().optional(),
  totalTokens: z.number().nonnegative().optional(),
  region: z.string().trim().min(1).max(100).optional(),
}).strict()
export type FireworksMetadata = z.infer<typeof fireworksMetadataSchema>
