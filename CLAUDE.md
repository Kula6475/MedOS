# Claude Code Instructions for MedOS

## Read before modifying the project

Before creating, modifying, moving, or deleting any project file, read all of the following documents in full:

1. `README.md`
2. `HACKATHON_PLAN.md`
3. `ARCHITECTURE.md`
4. `TASKS.md`
5. `CLAUDE.md`

Treat these documents as the source of truth for product scope, architecture, safety requirements, sponsor positioning, build order, and demo behavior. If the documents conflict with a direct user instruction, follow the direct instruction and update the relevant documentation when requested.

## Product constraints

MedOS is an AI-powered emergency department operations platform. It is clinical decision support and not medical advice, a medical device, an autonomous care system, or a replacement for clinicians.

All patient data must be synthetic. Never add real patient information, protected health information, or data that could reasonably be mistaken for a real patient record.

The five required agents are:

- Triage Agent.
- Medication Safety Agent.
- Lab Analysis Agent.
- Imaging Review Agent.
- Care Coordination Agent.

Braintrust is the primary sponsor integration and must remain central to the experience. Fireworks AI is the LLM inference provider for every agent.

Preserve the project message:

> **Fireworks powers the intelligence; Braintrust builds trust.**

## Engineering requirements

- Use TypeScript for application code.
- Use Next.js with the App Router.
- Use Tailwind CSS and shadcn/ui for the interface.
- Keep components small, modular, typed, and reusable.
- Keep server-only code and credentials out of client components.
- Use explicit shared types and runtime validation at external boundaries.
- Prefer structured agent outputs over free-form parsing.
- Preserve existing functionality unless the requested change explicitly replaces it.
- Avoid unrelated refactors while implementing focused tasks.
- Reuse established components and patterns before introducing alternatives.
- Keep the primary synthetic demonstration path reliable and understandable.
- Do not add dependencies without a clear need.

## API keys and secrets

- Never hardcode, print, log, commit, or expose API keys.
- Keep Fireworks and Braintrust credentials in server-only environment variables.
- Never prefix secret variables with `NEXT_PUBLIC_`.
- Commit only placeholder variable names in `.env.example`.
- Never commit `.env`, `.env.local`, or files containing live credentials.
- Do not expose complete model prompts or sensitive configuration in the browser unless explicitly required.

## AI and safety requirements

- Route all LLM inference through Fireworks AI.
- Trace every agent invocation through Braintrust.
- Include evaluation status, latency, confidence, and trace availability where required by the UI.
- Derive confidence from evaluations rather than model self-reporting.
- Validate agent responses before they reach the UI or another agent.
- Require evidence references for clinical findings and proposed actions.
- Preserve limitations and missing information.
- Require human review for every coordinated plan.
- Block or clearly mark unsafe, invalid, unsupported, or contradictory output.
- Do not implement autonomous orders, prescriptions, diagnoses, or EHR mutations.
- Do not claim clinical validation, regulatory approval, or HIPAA compliance.

## Change workflow

For each substantial task:

1. Read the project documentation.
2. Inspect the existing implementation and working tree.
3. Identify the smallest coherent change that satisfies the task.
4. Preserve existing functionality and user-owned changes.
5. Implement with modular TypeScript components and clear boundaries.
6. Update `TASKS.md` only when task status materially changes and the user has requested or authorized documentation updates.
7. Run relevant checks.
8. Report what changed, what was verified, and any remaining limitations.

## Verification requirements

After major changes, run:

- The configured lint command.
- The configured TypeScript type-check command, if separate.
- The production build command.

Also run focused tests for the changed area when available. Do not report a check as passing unless it was actually run successfully. If a check cannot run because the project is not yet scaffolded, dependencies are unavailable, or credentials are missing, state that clearly.

Before demo-related changes are considered complete, verify:

- The intended two-minute flow remains possible.
- The five-agent workflow remains visible and understandable.
- Braintrust remains the primary trust and observability integration.
- Fireworks remains the inference provider.
- Synthetic-data labels and clinical decision-support disclaimers remain visible.
- No API key or secret is present in client code, committed files, logs, or screenshots.

## Scope discipline

Prioritize the working golden path over breadth. Do not scaffold or implement authentication, a production database, FHIR integration, billing, scheduling, autonomous clinical actions, or additional sponsor features unless the user explicitly expands the scope.

The intended two-minute demo must culminate in visible Braintrust evidence and close with:

> **Fireworks powers the intelligence; Braintrust builds trust.**
