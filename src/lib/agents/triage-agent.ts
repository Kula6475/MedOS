import { evidenceRef } from "@/lib/schemas"
import { buildTriagePrompt } from "@/lib/prompts"

import { runSpecialistAgent, type Agent, type AgentModelOutput } from "./agent"
import type { AgentContext } from "./agent-context"

const DISPLAY_NAME = "Triage Agent"
function buildModelOutput(context: AgentContext): AgentModelOutput {
  const { patient } = context
  const latestVitalsIndex = patient.vitals.length - 1
  const latestVitals = patient.vitals[latestVitalsIndex]
  const abnormalCount = latestVitals?.abnormalFlags.length ?? 0

  const evidence: AgentModelOutput["evidence"] = [
    { reference: "chiefComplaint", description: patient.chiefComplaint },
  ]
  const possibleConcerns: string[] = []
  const missingInformation: string[] = []

  if (latestVitals) {
    evidence.push({
      reference: evidenceRef("vitals", latestVitalsIndex),
      description: `Most recent vitals recorded ${latestVitals.recordedAt}.`,
      sourceSection: "vitals",
    })

    if (latestVitals.bloodPressureSystolic !== undefined && latestVitals.bloodPressureSystolic < 90) {
      possibleConcerns.push(
        "Systolic blood pressure below 90 mmHg raises concern for possible shock physiology; requires clinician assessment.",
      )
    }
    if (latestVitals.heartRate !== undefined && latestVitals.heartRate > 100) {
      possibleConcerns.push("Tachycardia (heart rate above 100 bpm) noted on the most recent reading.")
    }
    if (latestVitals.oxygenSaturation !== undefined && latestVitals.oxygenSaturation < 92) {
      possibleConcerns.push("Oxygen saturation below 92% suggests possible hypoxemia.")
    }
    if (latestVitals.temperatureCelsius !== undefined && latestVitals.temperatureCelsius >= 38.5) {
      possibleConcerns.push("Temperature at or above 38.5°C is consistent with fever and possible infection.")
    }
    if (latestVitals.glasgowComaScale !== undefined && latestVitals.glasgowComaScale < 15) {
      possibleConcerns.push("Glasgow Coma Scale below 15 indicates possible altered mentation.")
    }
  } else {
    missingInformation.push("No vital signs recorded; urgency cannot be fully assessed.")
  }

  patient.symptoms.forEach((symptom, index) => {
    evidence.push({
      reference: evidenceRef("symptoms", index),
      description: `${symptom.name}: ${symptom.detail} (onset ${symptom.onset}).`,
      sourceSection: "symptoms",
    })
  })

  if (patient.vitals.length < 2) {
    missingInformation.push("Only one vitals snapshot recorded; a trend cannot yet be established.")
  }
  if (latestVitals && latestVitals.glasgowComaScale === undefined) {
    missingInformation.push("Glasgow Coma Scale not documented in the current vitals snapshot.")
  }

  const urgencyLine =
    abnormalCount >= 4
      ? "Multiple abnormal vital signs suggest a high-acuity presentation warranting immediate clinician evaluation."
      : abnormalCount >= 2
        ? "Several abnormal vital signs warrant prompt clinician evaluation."
        : "Vital signs show limited abnormality; continue routine time-sensitive evaluation."

  return {
    summary: `Triage review of "${patient.chiefComplaint}" with ${abnormalCount} abnormal vital sign field(s) on the most recent measurement. This is decision support only, not a confirmed diagnosis.`,
    recommendation: `${urgencyLine} Maintain continuous reassessment and confirm priority level with the treating clinician.`,
    evidence,
    possibleConcerns,
    missingInformation,
  }
}

export const triageAgent: Agent = {
  name: "triage",
  displayName: DISPLAY_NAME,
  run: (context) => {
    const prompt = buildTriagePrompt(context.patient)
    return runSpecialistAgent({
      name: "triage",
      displayName: DISPLAY_NAME,
      context,
      promptVersion: prompt.version,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      buildModelOutput,
    })
  },
}
