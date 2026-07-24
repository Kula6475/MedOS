import type { PatientDetail } from "@/lib/mock-patient-details"

export type AgentPhase = "Pending" | "Running" | "Evaluating" | "Complete"

export type MockAgentResult = {
  id: "triage" | "medication" | "labs" | "imaging" | "coordination"
  name: string
  activeMessage: string
  evaluatingMessage: string
  recommendation: string
  evidence: string[]
  confidence: number
  latency: number
  evaluation: "Pass" | "Review"
  evaluationScore: number
  model: string
}

function trimEvidence(value: string) {
  return value.length > 92 ? `${value.slice(0, 89)}…` : value
}

export function getMockAgentResults(detail: PatientDetail): MockAgentResult[] {
  const { patient } = detail
  const abnormalLabs = detail.labs.filter((lab) => lab.status !== "normal" && lab.status !== "pending")
  const severeAllergy = detail.allergies.find((allergy) => allergy.severity === "Severe")
  const firstRecommendation = detail.recommendations[0]

  return [
    {
      id: "triage",
      name: "Triage Agent",
      activeMessage: "Reviewing symptoms, vitals, and arrival data",
      evaluatingMessage: "Checking acuity consistency and evidence coverage",
      recommendation: patient.acuity === "ESI 1"
        ? "Maintain ESI 1 priority with immediate resuscitation-team attention."
        : `Maintain ${patient.acuity} priority and continue time-sensitive clinical evaluation.`,
      evidence: [patient.chiefComplaint, ...detail.vitals.slice(0, 3).map((vital) => `${vital.name}: ${vital.value} ${vital.unit}`)],
      confidence: patient.acuity === "ESI 1" ? 97 : 94,
      latency: 684,
      evaluation: "Pass",
      evaluationScore: 98,
      model: "llama-v3p3-70b-instruct",
    },
    {
      id: "medication",
      name: "Medication Safety Agent",
      activeMessage: "Checking medications, allergies, and renal considerations",
      evaluatingMessage: "Scoring allergy recall and contraindication coverage",
      recommendation: severeAllergy
        ? `Avoid ${severeAllergy.substance}-class exposure and require pharmacist review before antimicrobial selection.`
        : "Reconcile the active medication list and verify recent doses before treatment changes.",
      evidence: [
        ...detail.allergies.slice(0, 2).map((allergy) => `${allergy.substance}: ${allergy.reaction}`),
        ...detail.medications.slice(0, 2).map((medication) => `${medication.name} ${medication.dose} · ${medication.status}`),
      ],
      confidence: severeAllergy ? 99 : 93,
      latency: 742,
      evaluation: severeAllergy ? "Review" : "Pass",
      evaluationScore: severeAllergy ? 96 : 95,
      model: "llama-v3p3-70b-instruct",
    },
    {
      id: "labs",
      name: "Lab Analysis Agent",
      activeMessage: "Analyzing abnormal values and critical trends",
      evaluatingMessage: "Validating result references and missing-test coverage",
      recommendation: abnormalLabs.length
        ? `Prioritize review of ${abnormalLabs.slice(0, 2).map((lab) => lab.test).join(" and ")}; trend results after intervention.`
        : "No critical laboratory abnormality identified; continue condition-specific monitoring.",
      evidence: detail.labs.slice(0, 4).map((lab) => `${lab.test}: ${lab.value} (${lab.status})`),
      confidence: 96,
      latency: 816,
      evaluation: "Pass",
      evaluationScore: 97,
      model: "llama-v3p3-70b-instruct",
    },
    {
      id: "imaging",
      name: "Imaging Review Agent",
      activeMessage: "Extracting findings from the written imaging report",
      evaluatingMessage: "Checking report fidelity and unsupported-claim risk",
      recommendation: trimEvidence(detail.imaging[0].impression),
      evidence: [detail.imaging[0].study, trimEvidence(detail.imaging[0].findings)],
      confidence: detail.imaging[0].impression.toLowerCase().includes("pending") ? 82 : 94,
      latency: 903,
      evaluation: detail.imaging[0].impression.toLowerCase().includes("pending") ? "Review" : "Pass",
      evaluationScore: detail.imaging[0].impression.toLowerCase().includes("pending") ? 88 : 96,
      model: "llama-v3p3-70b-instruct",
    },
    {
      id: "coordination",
      name: "Care Coordination Agent",
      activeMessage: "Synthesizing validated specialist outputs",
      evaluatingMessage: "Running final safety and human-review checks",
      recommendation: firstRecommendation.action,
      evidence: [
        `Triage: ${patient.acuity} · ${patient.status}`,
        abnormalLabs.length ? `Labs: ${abnormalLabs.slice(0, 2).map((lab) => lab.test).join(", ")}` : "Labs: no critical values supplied",
        `Imaging: ${trimEvidence(detail.imaging[0].impression)}`,
        `Owner: ${firstRecommendation.owner}`,
      ],
      confidence: 95,
      latency: 1_124,
      evaluation: "Pass",
      evaluationScore: 97,
      model: "llama-v3p3-70b-instruct",
    },
  ]
}
