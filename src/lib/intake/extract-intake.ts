import { createModelProvider, type ModelProvider } from "@/lib/providers"
import { patientIntakeSchema, type PatientIntake } from "@/lib/schemas"

const INTAKE_PROMPT_VERSION = "medos-intake@2026-01"

const SYSTEM_PROMPT = `You are a clinical intake structurer for a SYNTHETIC emergency-department decision-support demo.
Convert the user's free-text clinical description into the structured JSON intake schema.

Rules:
- Extract only information present or clearly implied in the text. Never invent specific numbers, medications, or history.
- Omit any field the text does not support rather than guessing.
- Treat all data as synthetic and for demonstration only; do not add real patient identifiers.
- Use concise, clinically phrased entries.
- Map vital signs to their fields (heartRate, bloodPressureSystolic/Diastolic, respiratoryRate, oxygenSaturation, temperatureCelsius as Celsius, painScore 0-10, glasgowComaScale 3-15).`

export interface ExtractIntakeResult {
  intake: PatientIntake
  provider: "fireworks" | "mock"
  model: string
  fallbackUsed: boolean
}

// Turns free clinical text into a structured intake via the shared model provider. If the model is
// unavailable or fails, the provider falls back to the mock, which returns the note verbatim so the
// downstream assembler still produces a valid, analyzable record.
export async function extractIntakeFromText(
  text: string,
  provider: ModelProvider = createModelProvider(),
): Promise<ExtractIntakeResult> {
  const trimmed = text.trim().slice(0, 8_000)
  const fallbackIntake: PatientIntake = {
    chiefComplaint: "Free-text clinical intake",
    notes: [{ author: "Intake", role: "Submitted note", text: trimmed || "No text provided." }],
  }

  const result = await provider.generate<PatientIntake>({
    agent: "triage",
    promptVersion: INTAKE_PROMPT_VERSION,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Clinical text to structure:\n"""\n${trimmed}\n"""`,
    outputSchema: patientIntakeSchema,
    temperature: 0.1,
    maxOutputTokens: 1_800,
    mockResponse: fallbackIntake,
  })

  return {
    intake: result.data,
    provider: result.provider,
    model: result.model,
    fallbackUsed: result.fallbackUsed,
  }
}
