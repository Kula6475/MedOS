# Braintrust Integration

## Status

Implemented for MedOS Milestone 3 using the official `braintrust` TypeScript package (`3.21.0`) and manual spans behind the existing `ObservabilityProvider` abstraction.

The design was researched on July 24, 2026 using only official Braintrust documentation:

- [Tracing quickstart](https://www.braintrust.dev/docs/tracing-quickstart)
- [Trace application logic](https://www.braintrust.dev/docs/instrument/trace-application-logic)
- [Advanced tracing patterns](https://www.braintrust.dev/docs/instrument/advanced-tracing)
- [TypeScript SDK reference](https://www.braintrust.dev/docs/sdks/typescript/versions/3.21.0)
- [Score production traces](https://www.braintrust.dev/docs/evaluate/score-online)
- [Authentication](https://www.braintrust.dev/docs/admin/authentication)
- [Security](https://www.braintrust.dev/docs/security)

MedOS uses synthetic patient data only. It is clinical decision support for demonstration purposes, not medical advice, diagnosis, or autonomous care.

> **Fireworks powers the intelligence; Braintrust builds trust.**

## Dependency and authentication

The integration uses:

```text
braintrust 3.21.0
```

Braintrust is enabled only by server-side environment variables:

```env
OBSERVABILITY_PROVIDER=braintrust
BRAINTRUST_API_KEY=
BRAINTRUST_PROJECT_NAME=MedOS
```

The key must be stored privately in `.env.local` or deployment secret storage. No Braintrust variable uses a `NEXT_PUBLIC_` prefix. The provider passes the key directly to `initLogger`; it never prints the key, environment dumps, authorization headers, or raw SDK request objects.

The logger is configured with explicit manual context (`setCurrent: false`), asynchronous delivery, a sanitized flush-error handler, and a global masking function as defense in depth.

## Provider selection and fallback

`OBSERVABILITY_PROVIDER=local` is the default and requires no credentials. `createObservabilityProvider` selects Braintrust only when the mode is `braintrust` and a nonblank key is available.

It safely returns `LocalObservabilityProvider` when:

- the mode is absent or `local`;
- the Braintrust key is missing or blank; or
- Braintrust provider initialization throws.

In Braintrust mode, the provider also mirrors lifecycle events to local observability. Hosted span creation, metadata, evaluation, link, end, or flush failures are caught and reduced to fixed error categories. They never alter or reject a valid `PatientAnalysis` response.

## Trace hierarchy

Every completed orchestrator run creates one root task span and exactly five direct child task spans:

```text
patient-analysis
├── triage-agent
├── medication-safety-agent
├── lab-analysis-agent
├── imaging-review-agent
└── care-coordination-agent
```

The four specialist agents execute concurrently with `Promise.allSettled`. Care Coordination starts after their settled outputs are available. All five spans are siblings even though the coordinator runs later.

Agent execution closes its child span in `finally`. The orchestrator closes the root in `finally`. Final metadata logging and span termination have independent error guards, so a logging failure cannot skip `end()`. Specialist failures therefore retain their failed child span and do not prevent the remaining children or root from closing.

The provider awaits the SDK logger's supported `flush()` once after root completion. It does not flush each child, avoiding added per-agent latency. A hosted trace link is optional and never required for the API response.

## Recorded metadata

The provider enforces explicit allowlists.

Root-span metadata:

- `analysisId`
- synthetic `patientId`
- `workflowVersion`
- `modelProviderMode`
- `observabilityProviderMode`
- `specialistCount`
- `workflowCompletionStatus`
- `totalLatencyMs`
- `partialFailureCount`

Agent-span metadata:

- `agentName`
- synthetic `patientId`
- `provider`
- `model`
- `latencyMs`
- `retryCount`
- `fallbackUsed`
- `schemaValid`
- `completionStatus`
- `categorizedError`
- `evidenceReferenceCount`
- `findingCount`

Known numeric operational values are also written as Braintrust metrics, including latency, retry count, evidence-reference count, finding count, and partial-failure count.

Errors are recorded only as bounded categories. Stack traces, raw exception messages, and secrets are omitted from hosted metadata.

## Deterministic evaluations

Existing MedOS deterministic evaluator results are recorded on each agent span and the coordinated root result. Internal `0–100` scores are divided by 100 and clamped to Braintrust's `0–1` range. Original component and check names are retained, along with the normalized composite score.

Evaluation metadata explicitly identifies the method as `deterministic_safety_heuristics` and states that it is not a clinical-accuracy score. No LLM-as-a-judge evaluator is included in this milestone.

These heuristics support schema, evidence, unsupported-claim, safety-language, completeness, role-compliance, coordinator-consistency, and latency checks. They do not establish medical correctness or clinical validation.

## Privacy protections

Even though all MedOS records are synthetic, Braintrust logging follows a data-minimization model:

- only stable synthetic patient IDs are logged;
- metadata is filtered through strict root and agent allowlists;
- patient names, dates of birth, raw records, physician notes, medication lists, lab text, imaging text, prompts, and raw model outputs are not logged;
- recommendation and evidence text are replaced with counts;
- secret-like keys and nested values are masked globally;
- strings are bounded before upload;
- warnings use fixed categories and omit caught exception text.

MedOS does not claim HIPAA compliance, clinical validation, medical-device status, or clinical accuracy.

## Testing strategy and coverage

Credential-free tests use injected fake logger and span objects; they make no Braintrust network calls. Coverage includes:

- local default selection;
- missing-key and initialization-failure fallback;
- one root and exactly five direct child spans;
- successful and failed span termination;
- partial trace preservation;
- one flush after root completion;
- score normalization and clamping;
- deterministic-heuristic evaluation labeling;
- safe metadata allowlisting and nested secret masking;
- absence of raw synthetic patient content;
- unchanged `PatientAnalysis` validation; and
- continued analysis when Braintrust logging and flush fail.

Local integration verification runs with:

```bash
OBSERVABILITY_PROVIDER=local BRAINTRUST_API_KEY= MODEL_PROVIDER=mock
```

Live hosted verification is intentionally deferred until the user privately configures the three environment variables above. It should confirm the hierarchy, safe metadata, normalized scores, trace link, failure preservation, and upload after the root-level flush.

## Implementation files

Primary implementation:

- `src/lib/providers/braintrust-observability-provider.ts`
- `src/lib/providers/provider-factory.ts`
- `src/lib/providers/observability-provider.ts`
- `src/lib/providers/local-observability-provider.ts`
- `src/lib/orchestrator/analysis-orchestrator.ts`
- `src/lib/agents/agent.ts`

Credential-free tests:

- `src/lib/providers/braintrust-observability-provider.test.ts`
- existing provider and orchestrator tests

Configuration and documentation:

- `.env.example`
- `README.md`
- `FRONTEND_API_GUIDE.md`
- `package.json`
- `package-lock.json`

No frontend page, layout, dashboard component, styling file, or frontend mock-data file is part of this integration.
