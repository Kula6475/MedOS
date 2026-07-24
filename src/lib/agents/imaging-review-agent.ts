import { evidenceRef } from "@/lib/schemas"
import { buildImagingReviewPrompt } from "@/lib/prompts"

import { runSpecialistAgent, type Agent, type AgentModelOutput } from "./agent"
import type { AgentContext } from "./agent-context"

const DISPLAY_NAME = "Imaging Review Agent"
function buildModelOutput(context: AgentContext): AgentModelOutput {
  const { patient } = context
  const evidence: AgentModelOutput["evidence"] = []
  const possibleConcerns: string[] = []
  const missingInformation: string[] = []

  patient.imaging.forEach((report, index) => {
    evidence.push({
      reference: evidenceRef("imaging", index),
      description: `${report.study} (${report.performedAt}) impression: ${report.impression}`,
      sourceSection: "imaging",
    })

    if (report.impression.toLowerCase().includes("pending")) {
      missingInformation.push(`${report.study} interpretation is still pending; no findings are available yet.`)
    } else {
      possibleConcerns.push(`${report.study}: ${report.impression}`)
    }

    report.limitations.forEach((limitation) => {
      missingInformation.push(`${report.study} limitation: ${limitation}`)
    })
  })

  if (patient.imaging.length === 0) {
    missingInformation.push("No imaging reports supplied in the patient record.")
  }

  return {
    summary:
      patient.imaging.length > 0
        ? `Reviewed ${patient.imaging.length} written imaging report(s) based on report text only, not direct image inspection.`
        : "No imaging reports were supplied for review.",
    recommendation:
      possibleConcerns.length > 0
        ? "Correlate the reported imaging findings with the current clinical presentation and confirm with the interpreting radiologist as needed."
        : "No actionable imaging findings identified from the supplied report text.",
    evidence,
    possibleConcerns,
    missingInformation,
  }
}

export const imagingReviewAgent: Agent = {
  name: "imaging-review",
  displayName: DISPLAY_NAME,
  run: (context) => {
    const prompt = buildImagingReviewPrompt(context.patient)
    return runSpecialistAgent({
      name: "imaging-review",
      displayName: DISPLAY_NAME,
      context,
      promptVersion: prompt.version,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      buildModelOutput,
    })
  },
}
