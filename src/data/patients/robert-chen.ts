import type { PatientRecord } from "@/lib/schemas"

export const robertChen: PatientRecord = {
  id: "MED-1029",
  isSynthetic: true,
  demographics: {
    name: "Robert Chen",
    age: 67,
    sex: "M",
    dateOfBirth: "1958-01-19",
    medicalRecordNumber: "MED-1029",
    codeStatus: "Full code",
  },
  chiefComplaint: "New unilateral weakness and slurred speech",
  arrivalAt: "2025-01-15T09:41:00Z",
  history: [{ condition: "Atrial fibrillation" }, { condition: "Hypertension" }, { condition: "Hyperlipidemia" }],
  symptoms: [
    { name: "Left-sided weakness", detail: "Face, arm, and leg involvement", onset: "52 minutes" },
    { name: "Slurred speech", detail: "Witnessed by spouse", onset: "52 minutes" },
  ],
  vitals: [
    {
      recordedAt: "2025-01-15T09:44:00Z",
      heartRate: 86,
      bloodPressureSystolic: 188,
      bloodPressureDiastolic: 102,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      temperatureCelsius: 36.9,
      abnormalFlags: ["bloodPressureSystolic", "bloodPressureDiastolic"],
    },
  ],
  medications: [{ name: "Apixaban", dose: "5 mg", route: "PO", schedule: "Twice daily", status: "Last dose uncertain" }],
  allergies: [{ substance: "No known drug allergies", reaction: "Not applicable", severity: "mild" }],
  labs: [
    {
      test: "Glucose",
      value: "126",
      unit: "mg/dL",
      referenceRange: "70–140",
      abnormal: false,
      critical: false,
      collectedAt: "2025-01-15T09:38:00Z",
    },
    {
      test: "International normalized ratio",
      value: "1.2",
      referenceRange: "0.9–1.1",
      abnormal: true,
      critical: false,
      collectedAt: "2025-01-15T09:47:00Z",
    },
  ],
  imaging: [
    {
      study: "CT head without contrast",
      performedAt: "2025-01-15T09:54:00Z",
      impression: "No acute intracranial hemorrhage identified.",
      findings:
        "Subtle loss of gray-white differentiation in the right insular cortex. ASPECTS score of 8.",
      limitations: ["Non-contrast study; vascular occlusion not directly assessed"],
    },
  ],
  notes: [
    {
      author: "Dr. Maya Morgan",
      role: "Emergency medicine physician",
      recordedAt: "2025-01-15T09:56:00Z",
      text: "Acute focal neurologic deficit with last-known-well under one hour. Stroke team at bedside; anticoagulant timing being verified.",
    },
  ],
  timeline: [
    {
      occurredAt: "2025-01-15T09:41:00Z",
      title: "Emergency department arrival",
      detail: "Identity verified and synthetic encounter opened.",
      severity: "info",
    },
    {
      occurredAt: "2025-01-15T09:43:00Z",
      title: "Triage completed",
      detail: "ESI 2 assigned for new unilateral weakness and slurred speech.",
      severity: "critical",
    },
    {
      occurredAt: "2025-01-15T09:54:00Z",
      title: "Diagnostic imaging resulted",
      detail: "No acute intracranial hemorrhage; subtle right insular changes noted.",
      severity: "warning",
    },
    {
      occurredAt: "2025-01-15T09:56:00Z",
      title: "Physician reassessment",
      detail: "Stroke team bedside evaluation with anticoagulant timing under verification.",
      severity: "critical",
    },
  ],
}
