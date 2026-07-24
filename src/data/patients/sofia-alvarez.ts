import type { PatientRecord } from "@/lib/schemas"

export const sofiaAlvarez: PatientRecord = {
  id: "MED-1021",
  isSynthetic: true,
  demographics: {
    name: "Sofia Alvarez",
    age: 26,
    sex: "F",
    dateOfBirth: "1999-12-08",
    medicalRecordNumber: "MED-1021",
    codeStatus: "Full code",
  },
  chiefComplaint: "Asthma exacerbation",
  arrivalAt: "2025-01-15T09:50:00Z",
  history: [{ condition: "Moderate persistent asthma" }, { condition: "Seasonal allergic rhinitis" }],
  symptoms: [
    { name: "Wheezing", detail: "Persistent despite home rescue inhaler", onset: "6 hours" },
    { name: "Chest tightness", detail: "Worse with exertion", onset: "6 hours" },
  ],
  vitals: [
    {
      recordedAt: "2025-01-15T09:55:00Z",
      heartRate: 102,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 74,
      respiratoryRate: 24,
      oxygenSaturation: 93,
      temperatureCelsius: 37.1,
      painScore: 2,
      abnormalFlags: ["respiratoryRate", "oxygenSaturation"],
    },
  ],
  medications: [
    { name: "Albuterol-ipratropium", dose: "3 mL", route: "Nebulized", schedule: "Every 20 minutes ×3", status: "Active" },
    { name: "Prednisone", dose: "60 mg", route: "PO", schedule: "Once", status: "Given" },
  ],
  allergies: [{ substance: "Shellfish", reaction: "Urticaria", severity: "moderate" }],
  labs: [
    {
      test: "Venous pCO2",
      value: "43",
      unit: "mmHg",
      referenceRange: "38–50",
      abnormal: false,
      critical: false,
      collectedAt: "2025-01-15T09:48:00Z",
    },
    {
      test: "Respiratory viral panel",
      value: "Negative",
      referenceRange: "Negative",
      abnormal: false,
      critical: false,
      collectedAt: "2025-01-15T09:58:00Z",
    },
  ],
  imaging: [
    {
      study: "Chest radiograph",
      performedAt: "2025-01-15T10:02:00Z",
      impression: "No acute cardiopulmonary abnormality.",
      findings: "Mild hyperinflation. No focal airspace disease or pleural effusion.",
      limitations: ["Portable technique; subtle findings may be under-recognized"],
    },
  ],
  notes: [
    {
      author: "Dr. Maya Morgan",
      role: "Emergency medicine physician",
      recordedAt: "2025-01-15T10:05:00Z",
      text: "Asthma exacerbation with improving air movement after initial bronchodilator treatment; remains mildly hypoxemic.",
    },
  ],
  timeline: [
    {
      occurredAt: "2025-01-15T09:50:00Z",
      title: "Emergency department arrival",
      detail: "Identity verified and synthetic encounter opened.",
      severity: "info",
    },
    {
      occurredAt: "2025-01-15T09:52:00Z",
      title: "Triage completed",
      detail: "ESI 3 assigned for asthma exacerbation.",
      severity: "warning",
    },
    {
      occurredAt: "2025-01-15T09:58:00Z",
      title: "Laboratory specimens collected",
      detail: "Two results available or processing.",
      severity: "info",
    },
    {
      occurredAt: "2025-01-15T10:05:00Z",
      title: "Physician reassessment",
      detail: "Improving air movement with continued mild hypoxemia.",
      severity: "warning",
    },
  ],
}
