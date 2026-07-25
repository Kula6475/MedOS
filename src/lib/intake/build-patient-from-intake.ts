import { patientRecordSchema, type PatientIntake, type PatientRecord } from "@/lib/schemas"

export interface BuildPatientOptions {
  now?: Date
}

// A clearly-synthetic id that will not collide with the seeded MED-10xx fixtures.
function generateSyntheticId(now: Date): string {
  const stamp = now.getTime().toString(36).toUpperCase()
  const suffix = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0")
  return `SYN-${stamp}-${suffix}`
}

function birthDateFromAge(age: number, now: Date): string {
  return `${now.getUTCFullYear() - age}-01-01`
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

// Assembles a strict, valid, synthetic PatientRecord from a lenient intake object. Fills every
// required field with a safe default, drops malformed entries, and forces isSynthetic: true. The
// final patientRecordSchema.parse guarantees the result is agent-ready or throws.
export function buildPatientFromIntake(intake: PatientIntake, options: BuildPatientOptions = {}): PatientRecord {
  const now = options.now ?? new Date()
  const iso = now.toISOString()
  const id = generateSyntheticId(now)
  const age = intake.age ?? 50
  const sex = intake.sex ?? "F"

  const vitals = intake.vitals
    ? [
        {
          recordedAt: iso,
          heartRate: intake.vitals.heartRate,
          bloodPressureSystolic: intake.vitals.bloodPressureSystolic,
          bloodPressureDiastolic: intake.vitals.bloodPressureDiastolic,
          respiratoryRate: intake.vitals.respiratoryRate,
          oxygenSaturation: intake.vitals.oxygenSaturation,
          temperatureCelsius: intake.vitals.temperatureCelsius,
          painScore: intake.vitals.painScore,
          glasgowComaScale: intake.vitals.glasgowComaScale,
          abnormalFlags: intake.vitals.abnormalFlags ?? [],
        },
      ]
    : []

  const record = {
    id,
    isSynthetic: true as const,
    demographics: {
      name: clean(intake.name) ?? "Synthetic Patient",
      age,
      sex,
      dateOfBirth: birthDateFromAge(age, now),
      medicalRecordNumber: id,
    },
    chiefComplaint: clean(intake.chiefComplaint) ?? "Not specified in intake.",
    arrivalAt: iso,
    history: (intake.history ?? [])
      .map((condition) => clean(condition))
      .filter((condition): condition is string => Boolean(condition))
      .map((condition) => ({ condition })),
    symptoms: (intake.symptoms ?? [])
      .filter((symptom) => clean(symptom.name))
      .map((symptom) => ({
        name: symptom.name.trim(),
        detail: clean(symptom.detail) ?? symptom.name.trim(),
        onset: clean(symptom.onset) ?? "Unknown",
      })),
    vitals,
    medications: (intake.medications ?? [])
      .filter((medication) => clean(medication.name))
      .map((medication) => ({
        name: medication.name.trim(),
        dose: clean(medication.dose) ?? "Not specified",
        route: clean(medication.route) ?? "Not specified",
        schedule: clean(medication.schedule) ?? "Not specified",
        status: clean(medication.status) ?? "Active",
      })),
    allergies: (intake.allergies ?? [])
      .filter((allergy) => clean(allergy.substance))
      .map((allergy) => ({
        substance: allergy.substance.trim(),
        reaction: clean(allergy.reaction) ?? "Unknown reaction",
        severity: allergy.severity ?? "moderate",
      })),
    labs: (intake.labs ?? [])
      .filter((lab) => clean(lab.test))
      .map((lab) => ({
        test: lab.test.trim(),
        value: clean(lab.value) ?? "Not provided",
        ...(clean(lab.unit) ? { unit: clean(lab.unit) } : {}),
        referenceRange: clean(lab.referenceRange) ?? "Not provided",
        abnormal: lab.abnormal ?? false,
        critical: lab.critical ?? false,
        collectedAt: iso,
      })),
    imaging: (intake.imaging ?? [])
      .filter((study) => clean(study.study))
      .map((study) => ({
        study: study.study.trim(),
        performedAt: iso,
        impression: clean(study.impression) ?? "No impression provided.",
        findings: clean(study.findings) ?? "No findings provided.",
        limitations: [] as string[],
      })),
    notes: (intake.notes ?? [])
      .filter((note) => clean(note.text))
      .map((note) => ({
        author: clean(note.author) ?? "Intake",
        role: clean(note.role) ?? "AI intake",
        recordedAt: iso,
        text: note.text.trim(),
      })),
    timeline: [] as never[],
  }

  return patientRecordSchema.parse(record)
}
