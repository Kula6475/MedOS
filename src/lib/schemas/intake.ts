import { z } from "zod"

// A deliberately lenient "intake" shape that the model targets when structuring free-text clinical
// input. Every field is optional so the model is never forced to fabricate data; unknown keys are
// stripped (non-strict) so minor deviations don't fail the whole extraction. build-patient-from-intake
// fills the required scaffolding and forces isSynthetic before anything reaches an agent.
export const patientIntakeSchema = z.object({
  name: z.string().max(200).optional(),
  age: z.number().int().min(0).max(130).optional(),
  sex: z.enum(["F", "M"]).optional(),
  chiefComplaint: z.string().max(1_000).optional(),
  history: z.array(z.string().max(500)).max(100).optional(),
  symptoms: z
    .array(
      z.object({
        name: z.string().max(300),
        detail: z.string().max(2_000).optional(),
        onset: z.string().max(200).optional(),
      }),
    )
    .max(100)
    .optional(),
  vitals: z
    .object({
      heartRate: z.number().optional(),
      bloodPressureSystolic: z.number().optional(),
      bloodPressureDiastolic: z.number().optional(),
      respiratoryRate: z.number().optional(),
      oxygenSaturation: z.number().optional(),
      temperatureCelsius: z.number().optional(),
      painScore: z.number().optional(),
      glasgowComaScale: z.number().optional(),
      abnormalFlags: z.array(z.string().max(200)).max(20).optional(),
    })
    .optional(),
  medications: z
    .array(
      z.object({
        name: z.string().max(200),
        dose: z.string().max(100).optional(),
        route: z.string().max(100).optional(),
        schedule: z.string().max(200).optional(),
        status: z.string().max(100).optional(),
      }),
    )
    .max(100)
    .optional(),
  allergies: z
    .array(
      z.object({
        substance: z.string().max(200),
        reaction: z.string().max(500).optional(),
        severity: z.enum(["severe", "moderate", "mild"]).optional(),
      }),
    )
    .max(100)
    .optional(),
  labs: z
    .array(
      z.object({
        test: z.string().max(200),
        value: z.string().max(200).optional(),
        unit: z.string().max(100).optional(),
        referenceRange: z.string().max(200).optional(),
        abnormal: z.boolean().optional(),
        critical: z.boolean().optional(),
      }),
    )
    .max(100)
    .optional(),
  imaging: z
    .array(
      z.object({
        study: z.string().max(300),
        impression: z.string().max(4_000).optional(),
        findings: z.string().max(4_000).optional(),
      }),
    )
    .max(50)
    .optional(),
  notes: z
    .array(
      z.object({
        author: z.string().max(200).optional(),
        role: z.string().max(200).optional(),
        text: z.string().max(8_000),
      }),
    )
    .max(50)
    .optional(),
})
export type PatientIntake = z.infer<typeof patientIntakeSchema>
