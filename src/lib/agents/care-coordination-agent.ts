import type { AgentEvidence, AgentName, CarePriority, ResponsibleClinicalRole } from "@/lib/schemas"
import { buildCareCoordinationPrompt } from "@/lib/prompts"

import {
  coordinationAgentModelOutputSchema,
  runSpecialistAgent,
  type Agent,
  type AgentModelOutput,
  type CoordinationAgentModelOutput,
} from "./agent"
import type { CoordinationAgentContext } from "./agent-context"

const DISPLAY_NAME = "Care Coordination Agent"
const IMMEDIATE_PRIORITY_PATTERN = /critical|shock|hypoxemia|anaphylaxis|hemorrhage/i

const RESPONSIBLE_ROLE: Record<Exclude<AgentName, "care-coordination">, ResponsibleClinicalRole> = {
  triage: "care-team",
  "medication-safety": "pharmacist",
  "lab-analysis": "physician",
  "imaging-review": "physician",
}

function dedupeEvidence(entries: AgentEvidence[]): AgentEvidence[] {
  const seen = new Set<string>()
  const deduped: AgentEvidence[] = []
  for (const entry of entries) {
    if (seen.has(entry.reference)) continue
    seen.add(entry.reference)
    deduped.push(entry)
  }
  return deduped
}

// Reads only the other agents' already-validated AgentResult objects — never context.patient
// directly — so it can synthesize but never invent a clinical fact the specialists didn't report.
function buildModelOutput(context: CoordinationAgentContext): AgentModelOutput {
  const { specialistResults } = context
  const available = specialistResults.filter((result) => result.status === "passed" || result.status === "review")
  const unavailable = specialistResults.filter((result) => result.status === "failed" || result.status === "blocked")

  const evidence = dedupeEvidence(available.flatMap((result) => result.evidence))
  const possibleConcerns = available.flatMap((result) =>
    result.possibleConcerns.map((concern) => `${result.displayName}: ${concern}`),
  )
  const missingInformation = [
    ...available.flatMap((result) => result.missingInformation.map((item) => `${result.displayName}: ${item}`)),
    ...unavailable.map(
      (result) =>
        `${result.displayName} analysis was ${result.status === "blocked" ? "blocked by the safety gate" : "unavailable"} and is not reflected in this plan.`,
    ),
  ]

  const immediatePriorityAgents = available.filter((result) =>
    result.possibleConcerns.some((concern) => IMMEDIATE_PRIORITY_PATTERN.test(concern)),
  )
  const recommendationLines = available.map((result) => `${result.displayName}: ${result.recommendation}`)
  const recommendation = [
    immediatePriorityAgents.length > 0
      ? `Immediate review priority: ${immediatePriorityAgents.map((result) => result.displayName).join(", ")}.`
      : undefined,
    ...recommendationLines,
    "This consolidated plan is synthetic decision support only and requires human clinician review before any action is taken.",
  ]
    .filter((line): line is string => Boolean(line))
    .join(" ")

  const priorities = available.map((result) => {
    const priority: CarePriority = result.possibleConcerns.some((concern) => IMMEDIATE_PRIORITY_PATTERN.test(concern))
      ? "urgent"
      : result.missingInformation.length > 0 && result.possibleConcerns.length === 0
        ? "monitor"
        : "next"

    return {
      priority,
      action: result.recommendation,
      rationale: result.summary,
      evidenceRefs: result.evidence.map((item) => item.reference),
      responsibleRole: RESPONSIBLE_ROLE[result.agent as Exclude<AgentName, "care-coordination">],
    }
  })

  const situationSummary = `Consolidated review of ${available.length} of ${specialistResults.length} specialist agent output(s). This is synthetic decision support only, not a confirmed diagnosis.`

  return {
    summary: situationSummary,
    recommendation,
    evidence,
    possibleConcerns,
    missingInformation,
    coordinatedPlan: {
      situationSummary,
      priorities,
      unresolvedRisks: [...possibleConcerns, ...missingInformation],
      humanReviewRequired: true,
    },
  }
}

function buildProviderOutput(context: CoordinationAgentContext): CoordinationAgentModelOutput {
  return { coordinatedPlan: buildModelOutput(context).coordinatedPlan! }
}

function normalizeProviderOutput(
  output: CoordinationAgentModelOutput,
  context: CoordinationAgentContext,
): AgentModelOutput {
  const referencedEvidence = new Set(
    output.coordinatedPlan.priorities.flatMap((priority) => priority.evidenceRefs),
  )
  const evidence = dedupeEvidence(context.specialistResults.flatMap((result) => result.evidence)).filter((item) =>
    referencedEvidence.has(item.reference),
  )
  const unavailable = context.specialistResults.filter(
    (result) => result.status === "failed" || result.status === "blocked",
  )
  const available = context.specialistResults.filter(
    (result) => result.status === "passed" || result.status === "review",
  )
  const missingInformation = [
    ...available.flatMap((result) =>
      result.missingInformation.map((item) => `${result.displayName}: ${item}`),
    ),
    ...unavailable.map(
      (result) =>
        `${result.displayName} analysis was ${result.status === "blocked" ? "blocked by the safety gate" : "unavailable"} and is not reflected in this plan.`,
    ),
  ]
  const recommendation = [
    ...available.map((result) => {
      const action = output.coordinatedPlan.priorities.find(
        (priority) => priority.action === result.recommendation,
      )?.action
      return `${result.displayName}: ${action ?? result.recommendation}`
    }),
    "This consolidated plan is synthetic decision support only and requires human clinician review before any action is taken.",
  ].join(" ")

  return {
    summary: output.coordinatedPlan.situationSummary,
    recommendation,
    evidence,
    possibleConcerns: output.coordinatedPlan.unresolvedRisks,
    missingInformation,
    coordinatedPlan: output.coordinatedPlan,
  }
}

export const careCoordinationAgent: Agent<CoordinationAgentContext> = {
  name: "care-coordination",
  displayName: DISPLAY_NAME,
  run: (context) => {
    const prompt = buildCareCoordinationPrompt(context.patient.id, context.specialistResults)
    return runSpecialistAgent({
      name: "care-coordination",
      displayName: DISPLAY_NAME,
      context,
      promptVersion: prompt.version,
      outputSchema: coordinationAgentModelOutputSchema,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      maxOutputTokens: 2_000,
      timeoutMs: 20_000,
      maxRetries: 0,
      buildModelOutput: buildProviderOutput,
      normalizeModelOutput: normalizeProviderOutput,
    })
  },
}
