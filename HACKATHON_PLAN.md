# MedOS Hackathon Plan

## Goal

Build a polished proof of concept that demonstrates how specialized AI agents can support emergency-department operations while making every recommendation observable, measurable, and auditable.

The hackathon story is trustworthy AI rather than simply placing an LLM behind a dashboard:

> **Fireworks powers the intelligence; Braintrust builds trust.**

Braintrust is the primary sponsor integration. Fireworks AI provides inference for every agent. All patient records are synthetic, and MedOS is clinical decision support—not medical advice, autonomous care, or a replacement for clinicians.

## Golden-path scenario

The dashboard may contain several synthetic patients, but only one case needs complete depth and polish. The recommended showcase case is a synthetic older adult presenting with fever, respiratory symptoms, hypotension, tachycardia, elevated lactate, impaired renal function, an abnormal chest imaging report, and a documented severe medication allergy.

This case allows every agent to make a clear contribution:

1. The Triage Agent recognizes instability and raises the patient's priority.
2. The Medication Safety Agent identifies allergy and medication-related risk.
3. The Lab Analysis Agent highlights abnormal trends and missing information.
4. The Imaging Review Agent extracts the significant radiology finding and limitations.
5. The Care Coordination Agent combines the evidence into an urgent, next, and monitor action plan requiring clinician review.

## Required MVP

- Modern emergency-department command-center dashboard.
- Synthetic patient queue with acuity, wait time, status, and alerts.
- Detailed patient workspace with demographics, history, medications, allergies, vitals, labs, imaging, notes, and timeline.
- Four specialist agents running concurrently.
- Care Coordination Agent running after the specialists complete.
- Live progress states for every agent.
- Fireworks AI inference for all LLM requests.
- Braintrust tracing and evaluations for every agent invocation.
- Visible evaluation status, confidence, latency, evidence, and trace availability.
- Human-review safety gate before recommendations are displayed.
- Reliable hosted demo and clearly labeled replay fallback.

## Explicitly out of scope

- Real patient data or protected health information.
- Medical advice or autonomous diagnosis and treatment.
- Executing orders, prescriptions, alerts to clinicians, or EHR mutations.
- Production authentication, billing, scheduling, or hospital integrations.
- Full FHIR implementation.
- Model training or fine-tuning.
- Deep implementation of multiple patient scenarios.
- Additional sponsor integrations before the Braintrust and Fireworks path is stable.

## Build sequence

### Phase 1: Foundation

1. Initialize a Next.js project using TypeScript.
2. Configure Tailwind CSS and shadcn/ui.
3. Add environment-variable placeholders without committing secrets.
4. Define shared TypeScript and Zod schemas.
5. Create the primary synthetic patient and a small supporting queue.

Exit condition: the project runs locally and the synthetic data passes schema validation.

### Phase 2: Clinical interface

1. Build the command-center shell and navigation.
2. Add department metric cards, resource utilization, alerts, and patient queue.
3. Build the patient workspace.
4. Add sections for vitals, labs, medications, allergies, imaging, notes, and timeline.
5. Add the AI command panel with idle agent cards.

Exit condition: a user can navigate from the dashboard to the showcase patient's complete synthetic record.

### Phase 3: First end-to-end agent

1. Create the Fireworks AI client.
2. Implement the Triage Agent prompt and structured result schema.
3. Create a Braintrust root trace and Triage Agent child span.
4. Validate the Fireworks output.
5. Run deterministic grounding, coverage, and safety checks.
6. Display the result, latency, evaluation status, and trace reference.

Exit condition: one real Fireworks call completes the entire inference, validation, evaluation, tracing, and UI flow.

### Phase 4: Multi-agent workflow

1. Implement the Medication Safety Agent.
2. Implement the Lab Analysis Agent.
3. Implement the Imaging Review Agent.
4. Run the four specialists concurrently with independent timeouts.
5. Stream queued, processing, evaluating, and completed events to the UI.
6. Use `Promise.allSettled` so one failure does not crash the run.

Exit condition: all specialist agents run independently and failures are visibly represented.

### Phase 5: Coordination and safety gate

1. Pass validated specialist results to the Care Coordination Agent.
2. Require structured priorities categorized as urgent, next, or monitor.
3. Require evidence references, limitations, unresolved risks, and responsible roles.
4. Evaluate cross-agent consistency and clinical-safety language.
5. Block or mark recommendations for review when hard checks fail.

Exit condition: the final plan is shown only after the evaluation gate completes.

### Phase 6: Trust experience

1. Display a persistent “Braintrust monitored” indicator.
2. Add pass, review, and blocked badges to agent cards.
3. Display system confidence, latency, model, prompt version, and evidence count.
4. Add a trace drawer or trace link.
5. Make failed checks and missing data legible to judges.

Exit condition: the Braintrust integration is visible without leaving the main demonstration flow.

### Phase 7: Reliability and polish

1. Add loading transitions and restrained animations.
2. Add one retry and a bounded timeout for each external call.
3. Implement clearly labeled live and replay modes.
4. Test the deployed build in a clean browser.
5. Record a backup demo and capture completed Braintrust trace screenshots.
6. Freeze features and rehearse the presentation.

Exit condition: the demo can be delivered successfully even if a sponsor API experiences temporary latency.

## Suggested team ownership

- **Frontend owner:** dashboard, patient workspace, responsive design, and animation.
- **Agent owner:** Fireworks client, prompts, schemas, and orchestration.
- **Trust owner:** Braintrust spans, scorers, safety gates, and trust UI.
- **Demo owner:** synthetic fixtures, integration QA, deployment, backup recording, slides, and pitch.

For smaller teams, combine roles in that order while preserving the same build sequence.

## Intended two-minute demo flow

### 0:00–0:15 — Establish the problem

Emergency departments operate under time pressure with fragmented information. Clinicians need support, but black-box AI is not appropriate for high-trust care environments.

### 0:15–0:30 — Show the command center

Show the patient queue, operational metrics, alerts, and the synthetic critical patient. Select the patient to open the clinical workspace.

### 0:30–1:10 — Run the agents

Start analysis and show the four specialist agents processing concurrently. Let their statuses change from reviewing to evaluating to completed. Then show the Care Coordination Agent synthesizing their findings.

### 1:10–1:40 — Prove trustworthiness

Reveal the prioritized plan and show each agent's Braintrust evaluation status, evidence-based confidence, latency, and trace availability. Open one trace to demonstrate nested spans, Fireworks inference, scores, and the final safety gate.

### 1:40–1:55 — Explain safeguards

State that all data is synthetic, MedOS is clinical decision support and not medical advice, humans remain responsible, and unsafe or incomplete outputs are blocked or escalated for review.

### 1:55–2:00 — Close

“Fireworks powers the intelligence; Braintrust builds trust.”

## Demo contingency plan

- Pre-warm the configured Fireworks model.
- Keep the live path as the default.
- Provide a visible `Replay` badge when using cached results.
- Never represent replayed output as a live model call.
- Keep a short backup recording and screenshots of the matching Braintrust trace.
- Avoid editing the deployed application after the final rehearsal unless fixing a demo-blocking issue.

## Hackathon-ready definition

- The full golden path completes from one button.
- All five agents appear and transition through visible states.
- Every LLM request goes through Fireworks AI.
- Every invocation produces a Braintrust span and useful evaluation results.
- Confidence is computed from evaluation scores, not model self-reporting.
- Clinical statements contain valid references to the synthetic record.
- Unsafe or malformed outputs cannot silently reach the final plan.
- The demo works from its public URL in under two minutes.
- The safety and synthetic-data disclosures are visible.
- The team has a working backup and a rehearsed presentation.
