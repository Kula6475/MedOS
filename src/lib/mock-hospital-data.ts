export type PatientAcuity = "ESI 1" | "ESI 2" | "ESI 3" | "ESI 4"

export type PatientStatus =
  | "Resuscitation"
  | "Awaiting ICU"
  | "Under evaluation"
  | "Imaging"
  | "Treatment"

export type SyntheticPatient = {
  id: string
  name: string
  age: number
  sex: "F" | "M"
  chiefComplaint: string
  acuity: PatientAcuity
  status: PatientStatus
  location: string
  waitMinutes: number
  alerts: string[]
  vitals: string
}

export const departmentMetrics = {
  activePatients: 47,
  capacity: 58,
  icuBedsAvailable: 3,
  icuBedsTotal: 20,
  emergencyAlerts: 4,
  averageWaitMinutes: 38,
  hospitalUtilization: 81,
  arrivalsThisShift: 76,
}

export const syntheticPatients: SyntheticPatient[] = [
  {
    id: "MED-1042",
    name: "Elena Vasquez",
    age: 72,
    sex: "F",
    chiefComplaint: "Fever, dyspnea, hypotension",
    acuity: "ESI 1",
    status: "Resuscitation",
    location: "Trauma 2",
    waitMinutes: 0,
    alerts: ["Sepsis risk", "Severe penicillin allergy"],
    vitals: "BP 82/48 · HR 128 · SpO₂ 88%",
  },
  {
    id: "MED-1038",
    name: "Marcus Lee",
    age: 58,
    sex: "M",
    chiefComplaint: "Crushing substernal chest pain",
    acuity: "ESI 2",
    status: "Under evaluation",
    location: "Bay 7",
    waitMinutes: 7,
    alerts: ["ST elevation suspected"],
    vitals: "BP 154/92 · HR 104 · SpO₂ 95%",
  },
  {
    id: "MED-1035",
    name: "Aisha Thompson",
    age: 34,
    sex: "F",
    chiefComplaint: "Right lower-quadrant pain",
    acuity: "ESI 2",
    status: "Imaging",
    location: "Bay 11",
    waitMinutes: 14,
    alerts: ["Pregnancy status pending"],
    vitals: "BP 108/70 · HR 112 · Temp 38.1°C",
  },
  {
    id: "MED-1029",
    name: "Robert Chen",
    age: 67,
    sex: "M",
    chiefComplaint: "New unilateral weakness",
    acuity: "ESI 2",
    status: "Treatment",
    location: "Neuro 1",
    waitMinutes: 4,
    alerts: ["Stroke pathway active"],
    vitals: "BP 188/102 · HR 86 · SpO₂ 97%",
  },
  {
    id: "MED-1021",
    name: "Sofia Alvarez",
    age: 26,
    sex: "F",
    chiefComplaint: "Asthma exacerbation",
    acuity: "ESI 3",
    status: "Treatment",
    location: "Fast 4",
    waitMinutes: 32,
    alerts: [],
    vitals: "BP 118/74 · HR 102 · SpO₂ 93%",
  },
]

export const hospitalUtilization = [
  { label: "Emergency department", value: 81, detail: "47 / 58 bays", tone: "primary" },
  { label: "Intensive care", value: 85, detail: "17 / 20 beds", tone: "warning" },
  { label: "Medical-surgical", value: 76, detail: "121 / 160 beds", tone: "info" },
  { label: "Operating rooms", value: 62, detail: "8 / 13 rooms", tone: "trust" },
] as const

export const emergencyAlerts = [
  { title: "Sepsis pathway triggered", detail: "Elena Vasquez · Trauma 2", time: "1m ago", tone: "critical" },
  { title: "Stroke window approaching", detail: "Robert Chen · 22 minutes remaining", time: "3m ago", tone: "warning" },
  { title: "ICU transfer delayed", detail: "Bed assignment pending for MED-1017", time: "8m ago", tone: "warning" },
  { title: "Medication reconciliation", detail: "High-risk interaction requires review", time: "11m ago", tone: "info" },
] as const

export const agentStatus = [
  { name: "Triage Agent", status: "Monitoring", runs: 42, confidence: 94, latency: 620 },
  { name: "Medication Safety", status: "Reviewing", runs: 31, confidence: 97, latency: 540 },
  { name: "Lab Analysis", status: "Monitoring", runs: 38, confidence: 91, latency: 710 },
  { name: "Imaging Review", status: "Idle", runs: 19, confidence: 93, latency: 840 },
  { name: "Care Coordination", status: "Synthesizing", runs: 28, confidence: 92, latency: 960 },
] as const

export const observabilityMetrics = {
  evaluatedRuns: 158,
  passRate: 96.8,
  tracesAvailable: 158,
  flaggedForReview: 5,
  p95Latency: 1.28,
}

export const inferenceStatus = {
  status: "Operational",
  model: "llama-v3p3-70b-instruct",
  region: "US West",
  p50Latency: 612,
  p95Latency: 1280,
  requestsThisHour: 158,
  uptime: 99.99,
}
