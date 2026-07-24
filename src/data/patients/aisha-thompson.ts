import type { PatientRecord } from "@/lib/schemas"

export const aishaThompson: PatientRecord = {
  id: "MED-1035",
  isSynthetic: true,
  demographics: {
    name: "Aisha Thompson",
    age: 34,
    sex: "F",
    dateOfBirth: "1991-06-22",
    medicalRecordNumber: "MED-1035",
    codeStatus: "Full code",
  },
  chiefComplaint: "Right lower-quadrant abdominal pain",
  arrivalAt: "2025-01-15T09:33:00Z",
  history: [{ condition: "Polycystic ovary syndrome" }, { condition: "Prior ovarian cyst" }],
  symptoms: [
    { name: "Abdominal pain", detail: "Sharp right lower quadrant pain with guarding", onset: "12 hours" },
    { name: "Nausea", detail: "Two episodes of emesis", onset: "8 hours" },
  ],
  vitals: [
    {
      recordedAt: "2025-01-15T09:38:00Z",
      heartRate: 112,
      bloodPressureSystolic: 108,
      bloodPressureDiastolic: 70,
      respiratoryRate: 18,
      oxygenSaturation: 98,
      temperatureCelsius: 38.1,
      painScore: 7,
      abnormalFlags: ["heartRate", "temperatureCelsius", "painScore"],
    },
  ],
  medications: [{ name: "Acetaminophen", dose: "1,000 mg", route: "IV", schedule: "Once", status: "Given" }],
  allergies: [{ substance: "Latex", reaction: "Contact dermatitis", severity: "moderate" }],
  labs: [
    {
      test: "White blood cell count",
      value: "14.2",
      unit: "K/µL",
      referenceRange: "4.0–11.0",
      abnormal: true,
      critical: false,
      collectedAt: "2025-01-15T09:40:00Z",
    },
    {
      test: "Beta-hCG",
      value: "Pending",
      referenceRange: "Negative",
      abnormal: false,
      critical: false,
      collectedAt: "2025-01-15T09:40:00Z",
    },
  ],
  imaging: [
    {
      study: "Right upper and lower quadrant ultrasound",
      performedAt: "2025-01-15T09:45:00Z",
      impression: "Study in progress; final interpretation pending.",
      findings: "Preliminary images obtained. Formal radiology read outstanding.",
      limitations: ["Final radiology interpretation not yet available"],
    },
  ],
  notes: [
    {
      author: "Dr. Maya Morgan",
      role: "Emergency medicine physician",
      recordedAt: "2025-01-15T09:48:00Z",
      text: "Focal right lower quadrant tenderness with leukocytosis. Pregnancy status pending before further imaging and treatment decisions.",
    },
  ],
  timeline: [
    {
      occurredAt: "2025-01-15T09:33:00Z",
      title: "Emergency department arrival",
      detail: "Identity verified and synthetic encounter opened.",
      severity: "info",
    },
    {
      occurredAt: "2025-01-15T09:36:00Z",
      title: "Triage completed",
      detail: "ESI 2 assigned for right lower-quadrant abdominal pain.",
      severity: "warning",
    },
    {
      occurredAt: "2025-01-15T09:40:00Z",
      title: "Laboratory specimens collected",
      detail: "Two results available or processing.",
      severity: "warning",
    },
    {
      occurredAt: "2025-01-15T09:48:00Z",
      title: "Physician reassessment",
      detail: "Imaging pathway pending pregnancy status.",
      severity: "warning",
    },
  ],
}
