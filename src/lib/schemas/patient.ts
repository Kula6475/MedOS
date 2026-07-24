import { z } from "zod"

const requiredText = z.string().trim().min(1).max(4_000)
const identifier = z.string().trim().min(1).max(100)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD).")
const clinicalDate = z
  .string()
  .regex(/^\d{4}(?:-\d{2}-\d{2})?$/, "Expected a year (YYYY) or ISO date (YYYY-MM-DD).")
const isoDateTime = z.iso.datetime({ offset: true })

export const clinicalSeveritySchema = z.enum(["critical", "warning", "info"])
export type ClinicalSeverity = z.infer<typeof clinicalSeveritySchema>

export const patientDemographicsSchema = z.object({
  name: requiredText.max(200),
  age: z.number().int().min(0).max(130),
  sex: z.enum(["F", "M"]),
  dateOfBirth: isoDate,
  medicalRecordNumber: identifier,
  language: requiredText.max(100).optional(),
  codeStatus: requiredText.max(100).optional(),
}).strict()
export type PatientDemographics = z.infer<typeof patientDemographicsSchema>

export const vitalSignsSchema = z.object({
  recordedAt: isoDateTime,
  heartRate: z.number().min(0).max(350).optional(),
  bloodPressureSystolic: z.number().min(0).max(350).optional(),
  bloodPressureDiastolic: z.number().min(0).max(250).optional(),
  respiratoryRate: z.number().min(0).max(100).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  temperatureCelsius: z.number().optional(),
  painScore: z.number().min(0).max(10).optional(),
  glasgowComaScale: z.number().min(3).max(15).optional(),
  abnormalFlags: z.array(requiredText.max(200)).max(20),
}).strict()
export type VitalSigns = z.infer<typeof vitalSignsSchema>

export const allergySeveritySchema = z.enum(["severe", "moderate", "mild"])
export type AllergySeverity = z.infer<typeof allergySeveritySchema>

export const allergySchema = z.object({
  substance: requiredText.max(200),
  reaction: requiredText.max(500),
  severity: allergySeveritySchema,
}).strict()
export type Allergy = z.infer<typeof allergySchema>

export const medicationSchema = z.object({
  name: requiredText.max(200),
  dose: requiredText.max(100),
  route: requiredText.max(100),
  schedule: requiredText.max(200),
  status: requiredText.max(100),
}).strict()
export type Medication = z.infer<typeof medicationSchema>

export const medicalHistoryItemSchema = z.object({
  condition: requiredText.max(500),
  diagnosedAt: clinicalDate.optional(),
  notes: requiredText.optional(),
}).strict()
export type MedicalHistoryItem = z.infer<typeof medicalHistoryItemSchema>

export const labResultSchema = z.object({
  test: requiredText.max(200),
  value: requiredText.max(200),
  unit: requiredText.max(100).optional(),
  referenceRange: requiredText.max(200),
  abnormal: z.boolean(),
  critical: z.boolean(),
  collectedAt: isoDateTime,
}).strict()
export type LabResult = z.infer<typeof labResultSchema>

export const imagingReportSchema = z.object({
  study: requiredText.max(300),
  performedAt: isoDateTime,
  impression: requiredText,
  findings: requiredText,
  limitations: z.array(requiredText).max(20),
}).strict()
export type ImagingReport = z.infer<typeof imagingReportSchema>

export const clinicalNoteSchema = z.object({
  author: requiredText.max(200),
  role: requiredText.max(200),
  recordedAt: isoDateTime,
  text: requiredText,
}).strict()
export type ClinicalNote = z.infer<typeof clinicalNoteSchema>

export const patientTimelineEventSchema = z.object({
  occurredAt: isoDateTime,
  title: requiredText.max(300),
  detail: requiredText,
  severity: clinicalSeveritySchema,
}).strict()
export type PatientTimelineEvent = z.infer<typeof patientTimelineEventSchema>

// Supporting type: not in the requested contract list but required for PatientRecord.symptoms,
// which the Triage Agent consumes per ARCHITECTURE.md.
export const patientSymptomSchema = z.object({
  name: requiredText.max(300),
  detail: requiredText,
  onset: requiredText.max(200),
}).strict()
export type PatientSymptom = z.infer<typeof patientSymptomSchema>

// isSynthetic is a literal (not boolean) so a fixture can never be marked real data by omission.
export const patientRecordSchema = z.object({
  id: identifier,
  isSynthetic: z.literal(true),
  demographics: patientDemographicsSchema,
  chiefComplaint: requiredText.max(1_000),
  arrivalAt: isoDateTime,
  history: z.array(medicalHistoryItemSchema).max(100),
  symptoms: z.array(patientSymptomSchema).max(100),
  vitals: z.array(vitalSignsSchema).max(500),
  medications: z.array(medicationSchema).max(100),
  allergies: z.array(allergySchema).max(100),
  labs: z.array(labResultSchema).max(500),
  imaging: z.array(imagingReportSchema).max(100),
  notes: z.array(clinicalNoteSchema).max(200),
  timeline: z.array(patientTimelineEventSchema).max(500),
}).strict()
export type PatientRecord = z.infer<typeof patientRecordSchema>
