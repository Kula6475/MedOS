import { z } from "zod"

const UNSUPPORTED_FIREWORKS_KEYWORDS = new Set([
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "pattern",
  "format",
])

type JsonSchema = Record<string, unknown>

function removeUnsupportedKeywords(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeUnsupportedKeywords)
  if (value === null || typeof value !== "object") return value

  const sanitized: JsonSchema = {}
  for (const [key, child] of Object.entries(value)) {
    if (UNSUPPORTED_FIREWORKS_KEYWORDS.has(key)) continue
    if (key === "oneOf") {
      sanitized.anyOf = removeUnsupportedKeywords(child)
      continue
    }
    sanitized[key] = removeUnsupportedKeywords(child)
  }
  return sanitized
}

export function toFireworksJsonSchema<TOutput>(schema: z.ZodType<TOutput>): JsonSchema {
  const generated = z.toJSONSchema(schema, { unrepresentable: "any" })
  return removeUnsupportedKeywords(generated) as JsonSchema
}
