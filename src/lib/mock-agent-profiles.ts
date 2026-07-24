export type AgentId = "triage" | "medication" | "labs" | "imaging" | "coordination"

export type AgentState = "Monitoring" | "Reviewing" | "Idle" | "Synthesizing"

export type AgentProfile = {
  id: AgentId
  name: string
  purpose: string
  state: AgentState
  analysesCompleted: number
  avgEvaluationScore: number
  avgLatencyMs: number
  recentActivity: { detail: string; time: string }[]
  safetyChecks: string[]
  dataSources: string[]
  responsibilities: string[]
  inputs: string[]
  outputs: string[]
  constraints: string[]
}

export const agentProfiles: AgentProfile[] = [
  {
    id: "triage",
    name: "Triage Agent",
    purpose: "Reviews symptoms, vital signs, arrival information, and clinical risk indicators to propose an emergency priority.",
    state: "Monitoring",
    analysesCompleted: 386,
    avgEvaluationScore: 98,
    avgLatencyMs: 684,
    recentActivity: [
      { detail: "Maintained ESI 1 priority for Elena Vasquez · Trauma 2", time: "1m ago" },
      { detail: "Flagged tachycardia trend for Marcus Lee · Bay 7", time: "6m ago" },
      { detail: "Confirmed stable ESI 3 for Sofia Alvarez · Fast 4", time: "14m ago" },
    ],
    safetyChecks: ["Acuity consistency with vitals", "Critical instability coverage", "Evidence-reference validation"],
    dataSources: ["Vital signs", "Chief complaint", "Arrival context", "Triage history"],
    responsibilities: [
      "Propose an emergency severity index from supplied vitals and symptoms",
      "Identify critical instability requiring immediate attention",
      "Explain findings using direct references to the patient record",
    ],
    inputs: ["Symptoms", "Vital signs", "Arrival data", "Selected history"],
    outputs: ["Proposed acuity", "Risk findings", "Evidence references", "Missing information"],
    constraints: ["Never assigns a lower acuity than documented instability supports", "Cannot modify the acuity in the record—recommendation only"],
  },
  {
    id: "medication",
    name: "Medication Safety Agent",
    purpose: "Reviews medications, allergies, and relevant labs to detect allergy conflicts, interactions, and contraindications.",
    state: "Reviewing",
    analysesCompleted: 291,
    avgEvaluationScore: 96,
    avgLatencyMs: 742,
    recentActivity: [
      { detail: "Flagged severe penicillin allergy for Elena Vasquez", time: "2m ago" },
      { detail: "Verified apixaban timing for Robert Chen · Neuro 1", time: "9m ago" },
      { detail: "Cleared reconciliation for Sofia Alvarez · Fast 4", time: "18m ago" },
    ],
    safetyChecks: ["Documented allergy recall", "Contraindication coverage", "Renal-dose risk review"],
    dataSources: ["Active medications", "Documented allergies", "Relevant labs", "Proposed actions"],
    responsibilities: [
      "Detect potential allergy conflicts against proposed or active medications",
      "Surface interactions and contraindications for clinician review",
      "Identify renal or hepatic dosing risk from available labs",
    ],
    inputs: ["Allergies", "Active medications", "Relevant labs", "Proposed clinical actions"],
    outputs: ["Allergy conflicts", "Interaction risks", "Contraindications", "Required pharmacist review"],
    constraints: ["Never recommends a specific replacement medication without pharmacist review", "Always requires human sign-off before any medication change"],
  },
  {
    id: "labs",
    name: "Lab Analysis Agent",
    purpose: "Summarizes abnormal laboratory findings, detects trends, and highlights results requiring urgent attention.",
    state: "Monitoring",
    analysesCompleted: 342,
    avgEvaluationScore: 97,
    avgLatencyMs: 816,
    recentActivity: [
      { detail: "Prioritized lactate and procalcitonin for Elena Vasquez", time: "3m ago" },
      { detail: "Flagged pending β-hCG for Aisha Thompson · Bay 11", time: "11m ago" },
      { detail: "No critical values for Sofia Alvarez · Fast 4", time: "20m ago" },
    ],
    safetyChecks: ["Critical-value coverage", "Reference-range validation", "Missing-test disclosure"],
    dataSources: ["Laboratory results", "Collection timestamps", "Prior trend history"],
    responsibilities: [
      "Summarize abnormal findings against reference ranges",
      "Detect clinically important trends across the encounter",
      "Identify missing or repeat tests for clinician consideration",
    ],
    inputs: ["Laboratory values", "Collection timestamps"],
    outputs: ["Abnormal findings", "Trends", "Critical values", "Suggested repeat or missing tests"],
    constraints: ["Presents missing tests as considerations only, never as orders", "Does not interpret results outside supplied reference ranges"],
  },
  {
    id: "imaging",
    name: "Imaging Review Agent",
    purpose: "Extracts key findings from written radiology reports and connects them to the current presentation.",
    state: "Idle",
    analysesCompleted: 214,
    avgEvaluationScore: 95,
    avgLatencyMs: 903,
    recentActivity: [
      { detail: "Extracted right lower-lobe opacity for Elena Vasquez", time: "4m ago" },
      { detail: "Marked RUQ/RLQ ultrasound as pending for Aisha Thompson", time: "12m ago" },
      { detail: "Confirmed no acute hemorrhage for Robert Chen · Neuro 1", time: "16m ago" },
    ],
    safetyChecks: ["Report-grounding fidelity", "Unsupported-claim detection", "Limitations disclosure"],
    dataSources: ["Written radiology reports", "Study timestamps"],
    responsibilities: [
      "Extract the most clinically significant reported findings",
      "Identify relevant negative findings and stated limitations",
      "Connect imaging findings to the emergency department presentation",
    ],
    inputs: ["Written radiology report text", "Study type and time"],
    outputs: ["Key findings", "Negative findings", "Limitations", "Evidence references"],
    constraints: ["Analyzes written reports only—never interprets raw image pixels", "Flags pending studies rather than inferring an impression"],
  },
  {
    id: "coordination",
    name: "Care Coordination Agent",
    purpose: "Consumes validated specialist outputs and produces a prioritized action plan requiring human review.",
    state: "Synthesizing",
    analysesCompleted: 276,
    avgEvaluationScore: 97,
    avgLatencyMs: 1_124,
    recentActivity: [
      { detail: "Issued urgent/next/monitor plan for Elena Vasquez", time: "1m ago" },
      { detail: "Escalated stroke-team eligibility for Robert Chen", time: "10m ago" },
      { detail: "Logged unresolved pregnancy-status risk for Aisha Thompson", time: "13m ago" },
    ],
    safetyChecks: ["Cross-agent consistency", "Human-review requirement", "Autonomous-action language block"],
    dataSources: ["Triage output", "Medication safety output", "Lab analysis output", "Imaging review output"],
    responsibilities: [
      "Reconcile every validated specialist result into one plan",
      "Categorize actions as urgent, next, or monitor with rationale",
      "Surface unresolved risks and require human review before display",
    ],
    inputs: ["Validated specialist results", "Minimal patient context"],
    outputs: ["Situation summary", "Prioritized actions", "Responsible roles", "Unresolved risks"],
    constraints: ["Always returns humanReviewRequired: true", "Never executes an order, prescription, or EHR mutation"],
  },
]

export function getAgentProfile(id: string) {
  return agentProfiles.find((agent) => agent.id === id)
}
