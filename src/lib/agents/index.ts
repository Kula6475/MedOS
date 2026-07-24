import { imagingReviewAgent } from "./imaging-review-agent"
import { labAnalysisAgent } from "./lab-analysis-agent"
import { medicationSafetyAgent } from "./medication-safety-agent"
import { triageAgent } from "./triage-agent"

import type { Agent } from "./agent"
import type { AgentContext } from "./agent-context"

export * from "./agent"
export * from "./agent-context"
export { triageAgent } from "./triage-agent"
export { medicationSafetyAgent } from "./medication-safety-agent"
export { labAnalysisAgent } from "./lab-analysis-agent"
export { imagingReviewAgent } from "./imaging-review-agent"
export { careCoordinationAgent } from "./care-coordination-agent"

// The four specialists run concurrently; care-coordination runs afterward on their outputs, so it
// is intentionally excluded from this registry.
export const specialistAgents: Agent<AgentContext>[] = [
  triageAgent,
  medicationSafetyAgent,
  labAnalysisAgent,
  imagingReviewAgent,
]
