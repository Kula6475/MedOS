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
- [x] Review all documentation before scaffolding.
- [ ] Confirm the primary synthetic patient scenario.
- [ ] Confirm the Fireworks model available to the team.
- [ ] Create Braintrust and Fireworks project credentials.
- [ ] Assign team ownership for frontend, agents, trust, and demo readiness.

## 1. Project foundation

- [x] Scaffold Next.js with the App Router and TypeScript.
- [x] Configure Tailwind CSS.
- [x] Configure shadcn/ui.
- [x] Add lint, type-check, and production-build scripts.
- [ ] Add `.env.example` with variable names only. *(no backend integration exists yet to enumerate variables for)*
- [x] Ensure `.env.local` and other secret files are ignored.
- [x] Add shared project types. *(typed mock-data modules under `src/lib`; Zod contracts still pending real agent integration)*
- [ ] Add Zod schemas for patient data and agent results. *(backend/agent task — no Zod dependency yet)*

## 2. Synthetic patient data

- [x] Create the showcase critical patient fixture.
- [x] Create five smaller supporting patient fixtures for the queue.
- [x] Add demographics, history, medications, allergies, vitals, labs, imaging reports, notes, and timeline events.
- [ ] Give clinical facts stable evidence-reference paths. *(evidence strings exist per agent card; not yet a formal reference-ID system)*
- [x] Label every fixture and relevant UI surface as synthetic.
- [ ] Validate fixtures at application startup or test time. *(backend/test task)*
- [ ] Create expected findings for offline evaluation tests. *(backend/eval task)*

## 3. Dashboard

- [x] Build the responsive application shell.
- [x] Add emergency-department census and resource cards.
- [x] Add patient queue sorting by acuity and wait time.
- [x] Add severity, status, and alert badges.
- [x] Add ICU bed and resource-utilization indicators.
- [x] Add persistent “Braintrust monitored” branding.
- [x] Link patient rows to their workspace.

## 4. Patient workspace

- [x] Add patient header and safety disclaimer.
- [x] Add demographics and history.
- [x] Add medications and allergies.
- [x] Add vital signs and trends.
- [x] Add laboratory results.
- [x] Add imaging reports.
- [x] Add clinical notes.
- [x] Add the event timeline.
- [x] Add the AI command panel and analysis button.
- [ ] Add empty, loading, partial, completed, review, blocked, and failure states. *(pending, running, evaluating, complete, review-score, and a simulated failure+retry state are implemented in the UI; a distinct "blocked" evaluation state has no real safety gate to drive it yet)*

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

- [x] Add professional loading and completion animations.
- [x] Keep motion restrained and readable; `prefers-reduced-motion` respected throughout.
- [ ] Verify color contrast and keyboard navigation. *(built with focus-visible states and keyboard handlers throughout; not run through an automated a11y audit — see §13)*
- [ ] Verify dashboard and patient workspace at presentation resolution. *(could not launch a live dev server this session — see §13)*
- [x] Add explicit synthetic-data and decision-support labels.
- [x] Remove placeholder text and dead controls. *(every visible button now functions, navigates, or updates local state)*
- [x] Make Braintrust more visually prominent than secondary integrations.

## 12a. Frontend build session — 2026-07-24

Gap-filled the frontend against the existing (already substantial) implementation. New/changed:

- Added `/patients` (full queue: search, severity/status/department filters, sort by wait, table+card responsive layout, loading skeleton, empty/no-results states, severity legend).
- Added `/agents` (five specialized-agent cards with simulated metrics, opens a details sheet with responsibilities/inputs/outputs/constraints/safety checks).
- Added search field, notifications menu, profile menu, and a system-status indicator to the shared top navigation; added optional breadcrumb support.
- Added `Patients` and `Agents` to sidebar navigation; fixed active-state highlighting.
- Added a simulated failure + retry state to the "Analyze Patient" multi-agent workflow (deterministic, opt-in via a "Simulate failure" control — the default run always completes).
- Added a "Critical patients" dashboard metric card.

**Not done in this session (explicitly out of scope for a frontend-only pass):** any real Fireworks or Braintrust integration, Zod schemas, `.env.example`, fixture validation, or a true safety-gate "blocked" state — all remain backend/agent-orchestration work per §5–§11 above.

**Verification caveat:** this machine has no Node.js/npm installed, so `npm run lint`, `npm run build`, and a live dev-server/browser pass could not be run this session. Changes were verified by careful manual code review against existing patterns instead. Run the commands in §13 locally before treating this as demo-ready.

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
