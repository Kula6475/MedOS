# MedOS Implementation Tasks

This checklist is ordered by dependency and demo value. Do not begin application implementation until the project documentation has been reviewed and the team agrees on the golden path.

All patient data must be synthetic. MedOS is clinical decision support and not medical advice. Braintrust is the primary sponsor integration, and Fireworks AI is the inference provider.

> **Fireworks powers the intelligence; Braintrust builds trust.**

## 0. Documentation and decisions

- [x] Create `README.md`.
- [x] Create `HACKATHON_PLAN.md`.
- [x] Create `ARCHITECTURE.md`.
- [x] Create `TASKS.md`.
- [x] Create `CLAUDE.md`.
- [ ] Review all documentation before scaffolding.
- [ ] Confirm the primary synthetic patient scenario.
- [ ] Confirm the Fireworks model available to the team.
- [ ] Create Braintrust and Fireworks project credentials.
- [ ] Assign team ownership for frontend, agents, trust, and demo readiness.

## 1. Project foundation

- [ ] Scaffold Next.js with the App Router and TypeScript.
- [ ] Configure Tailwind CSS.
- [ ] Configure shadcn/ui.
- [ ] Add lint, type-check, and production-build scripts.
- [ ] Add `.env.example` with variable names only.
- [ ] Ensure `.env.local` and other secret files are ignored.
- [ ] Add shared project types.
- [ ] Add Zod schemas for patient data and agent results.

## 2. Synthetic patient data

- [ ] Create the showcase critical patient fixture.
- [ ] Create five smaller supporting patient fixtures for the queue.
- [ ] Add demographics, history, medications, allergies, vitals, labs, imaging reports, notes, and timeline events.
- [ ] Give clinical facts stable evidence-reference paths.
- [ ] Label every fixture and relevant UI surface as synthetic.
- [ ] Validate fixtures at application startup or test time.
- [ ] Create expected findings for offline evaluation tests.

## 3. Dashboard

- [ ] Build the responsive application shell.
- [ ] Add emergency-department census and resource cards.
- [ ] Add patient queue sorting by acuity and wait time.
- [ ] Add severity, status, and alert badges.
- [ ] Add ICU bed and resource-utilization indicators.
- [ ] Add persistent “Braintrust monitored” branding.
- [ ] Link patient rows to their workspace.

## 4. Patient workspace

- [ ] Add patient header and safety disclaimer.
- [ ] Add demographics and history.
- [ ] Add medications and allergies.
- [ ] Add vital signs and trends.
- [ ] Add laboratory results.
- [ ] Add imaging reports.
- [ ] Add clinical notes.
- [ ] Add the event timeline.
- [ ] Add the AI command panel and analysis button.
- [ ] Add empty, loading, partial, completed, review, blocked, and failure states.

## 5. Shared agent infrastructure

- [ ] Create a server-only Fireworks AI client.
- [ ] Make Fireworks model names environment-configurable.
- [ ] Create shared prompt conventions and prompt versions.
- [ ] Create structured output schemas.
- [ ] Add response parsing and Zod validation.
- [ ] Add per-agent timeout handling.
- [ ] Add one bounded retry for transient failures.
- [ ] Create the analysis-run state model.
- [ ] Implement Server-Sent Events or the simplest reliable progress stream.

## 6. Triage Agent vertical slice

- [ ] Implement the Triage Agent prompt.
- [ ] Send only relevant symptoms, vitals, and history.
- [ ] Return acuity, findings, evidence, missing data, and limitations.
- [ ] Create the Braintrust root trace.
- [ ] Trace the Triage Agent and Fireworks call.
- [ ] Run schema, evidence, critical-coverage, and safety checks.
- [ ] Attach scores and latency to Braintrust.
- [ ] Display the result and trust metadata in the UI.
- [ ] Verify this complete vertical slice before adding other agents.

## 7. Specialist agents

### Medication Safety Agent

- [ ] Implement medication, allergy, interaction, contraindication, and review findings.
- [ ] Add deterministic checks for supplied allergy and medication evidence.
- [ ] Trace the Fireworks call and evaluation in Braintrust.

### Lab Analysis Agent

- [ ] Implement abnormal-result and trend summarization.
- [ ] Identify missing or repeat tests only as items for clinician consideration.
- [ ] Add critical-value and evidence-reference checks.
- [ ] Trace the Fireworks call and evaluation in Braintrust.

### Imaging Review Agent

- [ ] Analyze written radiology reports only.
- [ ] Extract key findings, relevant negative findings, and limitations.
- [ ] Add report-grounding checks.
- [ ] Trace the Fireworks call and evaluation in Braintrust.

### Parallel orchestration

- [ ] Run all four specialists concurrently.
- [ ] Use settled results so one agent cannot crash the complete run.
- [ ] Stream real state transitions to the UI.
- [ ] Preserve and display partial results.
- [ ] Pass explicit failure summaries to the coordinator.

## 8. Care Coordination Agent

- [ ] Consume validated specialist outputs.
- [ ] Produce urgent, next, and monitor priorities.
- [ ] Require rationale and evidence for every action.
- [ ] Assign a responsible clinical role.
- [ ] Include unresolved risks and unavailable evidence.
- [ ] Require `humanReviewRequired: true`.
- [ ] Trace the Fireworks call and evaluation in Braintrust.
- [ ] Evaluate cross-agent consistency.

## 9. Safety gate and confidence

- [ ] Implement evidence-reference validation.
- [ ] Implement structured-output validation.
- [ ] Implement critical-finding coverage checks.
- [ ] Implement prohibited autonomous-action language checks.
- [ ] Implement cross-agent contradiction checks.
- [ ] Compute composite confidence from evaluation results.
- [ ] Apply pass, review, and blocked thresholds.
- [ ] Ensure hard failures override the composite score.
- [ ] Prevent blocked output from appearing as an approved recommendation.
- [ ] Explain failed checks in plain language.

## 10. Braintrust trust experience

- [ ] Confirm every analysis produces one root trace.
- [ ] Confirm every agent produces child spans.
- [ ] Log prompt version, Fireworks model, latency, scores, and mode.
- [ ] Display confidence, latency, status, evidence count, and limitations.
- [ ] Add trace availability and a safe trace link or trace identifier.
- [ ] Configure Braintrust online scoring as a secondary audit if time allows.
- [ ] Capture one representative completed trace for the presentation.
- [ ] Verify no secrets or real patient data appear in traces.

## 11. Reliability and replay

- [ ] Implement a clearly labeled live mode.
- [ ] Capture one successful run for replay mode.
- [ ] Add a visible replay badge.
- [ ] Ensure replay never generates a misleading live Braintrust status.
- [ ] Test agent timeouts and partial failures.
- [ ] Test malformed model output.
- [ ] Test the final blocked state.
- [ ] Pre-warm the Fireworks model before the demonstration.

## 12. UI polish

- [ ] Add professional loading and completion animations.
- [ ] Keep motion restrained and readable.
- [ ] Verify color contrast and keyboard navigation.
- [ ] Verify dashboard and patient workspace at presentation resolution.
- [ ] Add explicit synthetic-data and decision-support labels.
- [ ] Remove placeholder text and dead controls.
- [ ] Make Braintrust more visually prominent than secondary integrations.

## 13. Verification

- [ ] Run lint.
- [ ] Run TypeScript checks.
- [ ] Run production build.
- [ ] Test the primary case with live Fireworks and Braintrust credentials.
- [ ] Test the deployed URL in a clean browser.
- [ ] Confirm no API key is present in browser source or committed files.
- [ ] Confirm the five-agent flow completes within the demo budget.
- [ ] Confirm every displayed evidence reference resolves.
- [ ] Confirm all patient data is synthetic.
- [ ] Confirm safety disclaimers are visible.

## 14. Intended two-minute demo

- [ ] Rehearse the problem statement in 15 seconds.
- [ ] Show the command center and select the patient by 30 seconds.
- [ ] Complete the visible agent run by approximately 70 seconds.
- [ ] Show the coordinated plan and Braintrust evidence by 100 seconds.
- [ ] Explain safeguards by 115 seconds.
- [ ] Close at 120 seconds with “Fireworks powers the intelligence; Braintrust builds trust.”

## 15. Submission readiness

- [ ] Deploy a stable public build.
- [ ] Prepare the repository description and setup instructions.
- [ ] Record a 60–90 second backup video.
- [ ] Capture screenshots of the dashboard, patient workspace, and Braintrust trace.
- [ ] Prepare concise architecture and safeguard slides.
- [ ] Freeze features before final rehearsal.
- [ ] Submit early enough to preserve a deadline buffer.
