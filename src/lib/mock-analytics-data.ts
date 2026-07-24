export type AnalyticsRange = "24h" | "7d" | "30d"

export type ThroughputPoint = {
  label: string
  arrivals: number
  discharged: number
  wait: number
}

export const throughputByRange: Record<AnalyticsRange, ThroughputPoint[]> = {
  "24h": [
    { label: "00", arrivals: 8, discharged: 6, wait: 24 },
    { label: "04", arrivals: 6, discharged: 7, wait: 21 },
    { label: "08", arrivals: 14, discharged: 10, wait: 35 },
    { label: "12", arrivals: 19, discharged: 15, wait: 46 },
    { label: "16", arrivals: 22, discharged: 18, wait: 51 },
    { label: "20", arrivals: 16, discharged: 17, wait: 38 },
  ],
  "7d": [
    { label: "Fri", arrivals: 173, discharged: 157, wait: 43 },
    { label: "Sat", arrivals: 186, discharged: 171, wait: 47 },
    { label: "Sun", arrivals: 164, discharged: 158, wait: 36 },
    { label: "Mon", arrivals: 198, discharged: 182, wait: 49 },
    { label: "Tue", arrivals: 181, discharged: 176, wait: 41 },
    { label: "Wed", arrivals: 192, discharged: 184, wait: 44 },
    { label: "Thu", arrivals: 178, discharged: 169, wait: 38 },
  ],
  "30d": [
    { label: "W1", arrivals: 1214, discharged: 1138, wait: 45 },
    { label: "W2", arrivals: 1289, discharged: 1206, wait: 48 },
    { label: "W3", arrivals: 1176, discharged: 1124, wait: 39 },
    { label: "W4", arrivals: 1248, discharged: 1191, wait: 41 },
  ],
}

export const headlineAnalytics = {
  hospitalUtilization: 81,
  patientThroughput: 178,
  averageWait: 38,
  icuUtilization: 85,
  dischargeRate: 74,
}

export const utilizationUnits = [
  { label: "Emergency", value: 81, beds: "47 / 58", tone: "bg-primary" },
  { label: "Intensive care", value: 85, beds: "17 / 20", tone: "bg-warning" },
  { label: "Medical-surgical", value: 76, beds: "121 / 160", tone: "bg-info" },
  { label: "Observation", value: 69, beds: "22 / 32", tone: "bg-trust" },
] as const

export const emergencyTrends = [
  { label: "Fri", esi1: 6, esi2: 35, esi3: 81, esi4: 51 },
  { label: "Sat", esi1: 8, esi2: 42, esi3: 86, esi4: 50 },
  { label: "Sun", esi1: 5, esi2: 31, esi3: 78, esi4: 50 },
  { label: "Mon", esi1: 9, esi2: 47, esi3: 91, esi4: 51 },
  { label: "Tue", esi1: 7, esi2: 40, esi3: 84, esi4: 50 },
  { label: "Wed", esi1: 10, esi2: 45, esi3: 88, esi4: 49 },
  { label: "Thu", esi1: 8, esi2: 39, esi3: 82, esi4: 49 },
]

export const agentAnalytics = [
  { name: "Triage", confidence: 94, passRate: 97.8, runs: 386, latency: 684, evidence: 98 },
  { name: "Medication Safety", confidence: 97, passRate: 96.4, runs: 291, latency: 742, evidence: 99 },
  { name: "Lab Analysis", confidence: 93, passRate: 98.1, runs: 342, latency: 816, evidence: 97 },
  { name: "Imaging Review", confidence: 91, passRate: 94.9, runs: 214, latency: 903, evidence: 95 },
  { name: "Care Coordination", confidence: 95, passRate: 97.2, runs: 276, latency: 1124, evidence: 98 },
]

export const braintrustHistory = [
  { label: "Fri", pass: 221, review: 9, blocked: 2 },
  { label: "Sat", pass: 246, review: 11, blocked: 3 },
  { label: "Sun", pass: 208, review: 7, blocked: 1 },
  { label: "Mon", pass: 269, review: 14, blocked: 4 },
  { label: "Tue", pass: 241, review: 8, blocked: 2 },
  { label: "Wed", pass: 258, review: 12, blocked: 3 },
  { label: "Thu", pass: 238, review: 9, blocked: 2 },
]

export const fireworksLatency = [
  { bucket: "<400", requests: 46 },
  { bucket: "400–600", requests: 93 },
  { bucket: "600–800", requests: 142 },
  { bucket: "800–1k", requests: 88 },
  { bucket: "1–1.5k", requests: 42 },
  { bucket: ">1.5k", requests: 11 },
]

export const fireworksMetrics = {
  requests: 422,
  p50: 684,
  p95: 1280,
  tokens: 1.84,
  uptime: 99.99,
}
