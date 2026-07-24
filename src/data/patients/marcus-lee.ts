import type { PatientRecord } from "@/lib/schemas"

export const marcusLee: PatientRecord = {
  id: "MED-1038",
  isSynthetic: true,
  demographics: {
    name: "Marcus Lee",
    age: 58,
    sex: "M",
    dateOfBirth: "1967-10-02",
    medicalRecordNumber: "MED-1038",
    codeStatus: "Full code",
  },
  chiefComplaint: "Crushing substernal chest pain",
  arrivalAt: "2025-01-15T09:20:00Z",
  history: [
    { condition: "Hyperlipidemia" },
    { condition: "Tobacco use disorder" },
    { condition: "Family history of premature coronary artery disease" },
  ],
  symptoms: [
    { name: "Chest pain", detail: "Crushing, substernal, radiating to left arm", onset: "45 minutes" },
    { name: "Diaphoresis", detail: "Profuse with nausea", onset: "40 minutes" },
  ],
  vitals: [
    {
      recordedAt: "2025-01-15T09:25:00Z",
      heartRate: 104,
      bloodPressureSystolic: 154,
      bloodPressureDiastolic: 92,
      respiratoryRate: 20,
      oxygenSaturation: 95,
      temperatureCelsius: 37.0,
      painScore: 8,
      abnormalFlags: ["heartRate", "bloodPressureSystolic", "bloodPressureDiastolic", "painScore"],
    },
  ],
  medications: [
    { name: "Aspirin", dose: "324 mg", route: "PO", schedule: "Once", status: "Given" },
    { name: "Nitroglycerin", dose: "0.4 mg", route: "SL", schedule: "As directed", status: "Active" },
  ],
  allergies: [{ substance: "No known drug allergies", reaction: "Not applicable", severity: "mild" }],
  labs: [
    {
      test: "High-sensitivity troponin",
      value: "186",
      unit: "ng/L",
      referenceRange: "<19",
      abnormal: true,
      critical: true,
      collectedAt: "2025-01-15T09:31:00Z",
    },
    {
      test: "Potassium",
      value: "4.1",
      unit: "mmol/L",
      referenceRange: "3.5–5.1",
      abnormal: false,
      critical: false,
      collectedAt: "2025-01-15T09:31:00Z",
    },
  ],
  imaging: [
    {
      study: "12-lead ECG",
      performedAt: "2025-01-15T09:27:00Z",
      impression: "ST elevation in leads II, III, and aVF consistent with acute inferior STEMI.",
      findings: "Reciprocal changes in leads I and aVL. Sinus tachycardia at 104 bpm.",
      limitations: ["Single ECG timepoint; serial tracings not yet available"],
    },
  ],
  notes: [
    {
      author: "Dr. Maya Morgan",
      role: "Emergency medicine physician",
      recordedAt: "2025-01-15T09:33:00Z",
      text: "Presentation and ECG are concerning for acute inferior STEMI. Cardiology notified and catheterization laboratory activation initiated.",
    },
  ],
  timeline: [
    {
      occurredAt: "2025-01-15T09:20:00Z",
      title: "Emergency department arrival",
      detail: "Identity verified and synthetic encounter opened.",
      severity: "info",
    },
    {
      occurredAt: "2025-01-15T09:23:00Z",
      title: "Triage completed",
      detail: "ESI 2 assigned for crushing substernal chest pain.",
      severity: "warning",
    },
    {
      occurredAt: "2025-01-15T09:27:00Z",
      title: "Diagnostic study resulted",
      detail: "ST elevation identified in leads II, III, and aVF.",
      severity: "critical",
    },
    {
      occurredAt: "2025-01-15T09:33:00Z",
      title: "Physician reassessment",
      detail: "STEMI pathway activated with cardiology notified.",
      severity: "critical",
    },
  ],
}
