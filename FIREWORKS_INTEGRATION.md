# Fireworks AI Integration Plan

## Status

This document was written as the implementation plan for MedOS Milestone 2 before any Fireworks code changes. The plan was approved and has now been implemented locally; live credential verification remains pending.

Milestone 1 remains operational with deterministic mock inference and local observability. The Fireworks provider, controlled retry, structured-output validation, secure prompts, and deterministic fallback are implemented. No real API key has been created, read, printed, modified, or committed.

All MedOS records remain synthetic. MedOS is clinical decision support for demonstration purposes, not medical advice, a confirmed diagnosis, or a replacement for licensed clinicians.

> **Fireworks powers the intelligence; Braintrust builds trust.**

## Official documentation reviewed

Only current official Fireworks AI documentation and Fireworks-owned model pages were used:

- [Text Models and JavaScript OpenAI-compatible client](https://docs.fireworks.ai/guides/querying-text-models)
- [Structured Outputs](https://docs.fireworks.ai/structured-responses/structured-response-formatting)
- [Inference Error Codes](https://docs.fireworks.ai/guides/inference-error-codes)
- [Serverless Rate Limits](https://docs.fireworks.ai/serverless/rate-limits)
- [Serverless Overview](https://docs.fireworks.ai/serverless/overview)
- [Model naming and deployment overview](https://docs.fireworks.ai/models/overview)
- [Checking serverless model availability](https://docs.fireworks.ai/faq-new/models-inference/how-to-check-if-a-model-is-available-on-serverless)
- [Recommended Models](https://docs.fireworks.ai/guides/recommended-models)
- [Fireworks Changelog](https://docs.fireworks.ai/updates/changelog)
- [GPT-OSS 120B serverless model page](https://fireworks.ai/models/fireworks/gpt-oss-120b)

Documentation was reviewed on July 24, 2026. Model availability can change, so the implementation will keep the model configurable and verify the selected model before live testing.

## Confirmed integration shape

Fireworks exposes an OpenAI-compatible Chat Completions API. The official JavaScript example uses the `openai` package with:

```ts
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
})
```

The client and key will exist only in server-side modules. The browser will continue calling MedOS route handlers and will never call Fireworks directly.

The implementation will use non-streaming Chat Completions for Milestone 2. This keeps the existing `ModelProvider.generate()` contract intact while the four specialist calls continue to run concurrently through `Promise.allSettled`.

## Proposed configuration

The following placeholders will be documented in `.env.example` during implementation:

```dotenv
MODEL_PROVIDER=mock
FIREWORKS_API_KEY=
FIREWORKS_MODEL=accounts/fireworks/models/gpt-oss-120b
```

Rules:

- `MODEL_PROVIDER=mock` remains the zero-credential default.
- `MODEL_PROVIDER=fireworks` selects live Fireworks inference.
- `FIREWORKS_API_KEY` is read only on the server.
- No `NEXT_PUBLIC_FIREWORKS_API_KEY` variable will exist.
- `.env.local` will remain ignored and will never be created, printed, modified, or committed by the implementation.
- `FIREWORKS_MODEL` remains configurable because Fireworks can deprecate serverless models.
- The API base URL will be a code constant unless a concrete deployment requirement justifies making it configurable.

### Initial model choice

The proposed default is `accounts/fireworks/models/gpt-oss-120b` because its current Fireworks model page marks it ready and serverless, and the current Fireworks recommendations identify GPT-OSS 120B for extraction and general-purpose work. The Fireworks changelog also lists it as the replacement for the retired Llama 3.3 70B serverless model.

Before live verification, the selected model must be checked in the Fireworks model library or List Models API with `supports_serverless=true`. If structured-output quality or latency is unsuitable, only `FIREWORKS_MODEL` should need to change.

## Planned files

Expected additions:

- `src/lib/providers/fireworks-model-provider.ts`
- `src/lib/providers/fireworks-model-provider.test.ts`
- `src/lib/providers/fallback-model-provider.ts`
- `src/lib/providers/fallback-model-provider.test.ts`
- `src/lib/providers/fireworks-errors.ts`
- `src/lib/providers/fireworks-schema.ts`
- `src/lib/prompts/triage-prompt.ts`
- `src/lib/prompts/medication-safety-prompt.ts`
- `src/lib/prompts/lab-analysis-prompt.ts`
- `src/lib/prompts/imaging-review-prompt.ts`
- `src/lib/prompts/care-coordination-prompt.ts`

Expected updates:

- `src/lib/providers/provider-factory.ts`
- `src/lib/providers/index.ts`
- `src/lib/providers/model-provider.ts`
- The five agent modules, to pass minimal structured context to their prompt builders
- Provider and orchestrator tests
- `.env.example`, with placeholders only
- `FRONTEND_API_GUIDE.md`, to explain live versus fallback provider metadata
- `package.json` and `package-lock.json`, to add the official OpenAI JavaScript client

Frontend-owned pages, layouts, components, styling, and frontend mock-data files will remain untouched.

## FireworksModelProvider design

`FireworksModelProvider` will implement the existing `ModelProvider` interface. Agent and orchestrator code will continue to depend on the abstraction rather than on the OpenAI client.

For each request the provider will:

1. Confirm it is running on the server.
2. Validate that `FIREWORKS_API_KEY` and the configured model are present.
3. Build system and user messages from already-sanitized agent prompt inputs.
4. Send a non-streaming Chat Completions request to Fireworks.
5. Request schema-constrained JSON through `response_format.type = "json_schema"`.
6. Reject an empty response or a response whose `finish_reason` indicates truncation.
7. Parse the message content as JSON.
8. Validate the parsed object with the request’s original Zod schema.
9. Return model name, provider name, prompt version, latency, token usage, fallback state, and raw content through `ModelProviderResult`.

No hidden chain-of-thought or reasoning content will be requested, stored, returned, or displayed. Fireworks documents that schema-constrained `response_format` disables reasoning output; MedOS needs the structured clinical-support result, not private reasoning.

## Structured output strategy

Fireworks recommends `response_format: { type: "json_schema" }` for schema-conformant output and recommends also instructing the model to return JSON in the prompt.

MedOS will use two validation layers:

1. A Fireworks-compatible JSON Schema constrains generation.
2. The existing full Zod schema validates the parsed result after generation.

This separation is required because Fireworks currently supports most JSON Schema 2020-12 constructs but does not support:

- `oneOf`
- `minLength` or `maxLength`
- `minItems` or `maxItems`
- regular-expression `pattern`
- external `$ref` values

The current MedOS Zod schemas intentionally contain length limits and other runtime safety constraints. The schema adapter will remove unsupported generation-time keywords while preserving:

- primitive types
- object properties and required fields
- `additionalProperties`
- array item schemas
- `anyOf` and `allOf`
- root-local `$defs` and `$ref` references

The original Zod schema will remain authoritative. A Fireworks response that satisfies the reduced generation schema but fails Zod validation will be treated as malformed output and trigger the controlled fallback path.

The prompt will also include a concise representation of the expected output contract because Fireworks notes that the model does not automatically see the schema enforced by `response_format`.

## Secure prompts for the five agents

Prompts will be server-owned, versioned, and role-specific. They will never include secrets, environment values, hidden reasoning requests, or real patient data.

### Triage Agent

Receives only the synthetic patient identifier, chief complaint, arrival time, symptoms, relevant history, and vital-sign snapshots. It must use cautious language, cite stable record paths, avoid confirmed diagnoses, and require clinician confirmation of urgency.

### Medication Safety Agent

Receives only medications, allergies, relevant organ-function history, and relevant laboratory values. It must describe potential risks and pharmacist/clinician review requirements without autonomously ordering, stopping, or administering medication.

### Lab Analysis Agent

Receives laboratory values, units, reference ranges, abnormal/critical flags, and collection timestamps. It may identify missing or repeat information for clinician consideration but cannot diagnose from laboratory data.

### Imaging Review Agent

Receives written imaging reports only. It must state that it did not inspect raw images and must distinguish report findings, pending interpretations, and limitations.

### Care Coordination Agent

Receives evaluated specialist outputs and explicit unavailable/blocked-agent summaries. It will not receive the full patient record. It must produce the structured urgent/next/monitor plan, preserve evidence references, assign allowed responsible roles, surface unresolved risks, and set `humanReviewRequired: true`.

All prompt payloads will be serialized from typed objects rather than string-concatenated user input. Delimiters and explicit instructions will state that synthetic record text is data, not executable instruction.

## Timeout and retry policy

Each live model request will have an independent timeout controlled by the existing `timeoutMs` request option and a conservative server default.

MedOS will perform at most one retry. The retry will use bounded exponential backoff with jitter and will apply only to transient conditions identified by Fireworks documentation:

- `408` request timeout
- `429` rate limit or capacity saturation
- `502` bad gateway
- `503` service unavailable/overloaded
- `504` gateway timeout
- `520` unknown transient server error
- retryable network failures

The following will not be retried:

- `400` malformed request
- `401` invalid or missing credentials
- `402` billing or usage restriction
- `403` forbidden
- `404` invalid endpoint, unavailable model, or missing permission
- `405` unsupported method
- `412` account or model precondition failure
- `413` payload too large
- Zod validation failure after a syntactically successful response

Fireworks recommends exponential backoff for `429` responses. Response rate-limit headers will be recorded when safely accessible, but they will not be exposed to the browser unless a stable product requirement is defined.

## Deterministic fallback behavior

The deterministic `MockModelProvider` remains the reliable demo fallback.

The provider composition will be:

```text
MODEL_PROVIDER=mock
  -> MockModelProvider

MODEL_PROVIDER=fireworks
  -> FireworksModelProvider
  -> one controlled retry for transient errors
  -> MockModelProvider fallback if live inference remains unavailable or invalid
```

Fallback requirements:

- Fallback must be explicit in `fallbackUsed` and provider metadata.
- The original safe error category, retry count, and selected model must remain available for observability without exposing secrets.
- The fallback response must still pass the same Zod validation and deterministic evaluator pipeline.
- One failed Fireworks specialist must not crash the other specialists.
- A fallback result must never be presented as live Fireworks inference.
- Missing `FIREWORKS_API_KEY` in Fireworks mode must produce a controlled missing-configuration result and deterministic fallback, not an unhandled exception.

## Error normalization and secret safety

Provider errors will be normalized into bounded, typed categories such as:

- `missing_configuration`
- `authentication_error`
- `rate_limited`
- `timeout`
- `network_error`
- `invalid_response`
- `model_unavailable`
- `provider_unavailable`

Raw SDK errors can contain long response bodies or request context. Before an error enters an `AgentResult`, log, trace, or API response, MedOS will:

- remove credential-like strings and authorization headers
- truncate bounded public messages
- retain only safe status, error category, retryability, retry count, and provider request ID when available
- never log `FIREWORKS_API_KEY`
- never log unnecessary raw synthetic patient payloads

This normalization also closes the Milestone 1 edge case where an oversized provider error could exceed the `AgentError` schema and defeat partial-failure handling.

## Provider metadata

Successful Fireworks results will populate:

- `provider: "fireworks"`
- exact returned model identifier
- prompt version
- measured client-observed latency
- prompt, completion, and total token counts when returned
- retry count
- `fallbackUsed: false`

Fallback results will identify mock inference and set `fallbackUsed: true`. Fireworks documentation notes that token usage is returned in response bodies and performance metrics may be available in headers. Milestone 2 will capture standard token usage first; optional Fireworks-specific performance headers will only be added if the OpenAI-compatible raw-response path can read them without weakening the provider abstraction.

## Tests planned before live verification

All tests must run without a Fireworks key.

### Unit tests

- Provider builds the correct base URL, model, messages, and JSON Schema request.
- Missing-key Fireworks mode falls back safely.
- Mock mode never reads or requires `FIREWORKS_API_KEY`.
- Successful JSON is parsed and Zod-validated.
- Empty content is rejected.
- Truncated output is rejected.
- Malformed JSON falls back safely.
- Schema-invalid JSON falls back safely.
- Timeout aborts the request and falls back.
- One retry occurs for `408`, `429`, `502`, `503`, `504`, and `520`.
- Authentication, permission, billing, bad-request, missing-model, and oversized-payload errors are not retried.
- Error messages are bounded and credential-like content is redacted.
- Token usage and measured latency are returned.
- Fallback metadata distinguishes live and mock inference.

### Orchestrator and route tests

- All five agents complete in mock mode without a key.
- Fireworks provider selection is server-only.
- Four specialists remain concurrent.
- One Fireworks specialist failure preserves other specialist results.
- Coordinator runs after available specialist results.
- Blocked or malformed live output cannot appear as an approved recommendation.
- API error responses never expose SDK errors, prompts, environment values, or stack traces.

### Required verification commands

```bash
npm test
npm run lint
npm run build
```

## Implementation sequence after approval

1. Add the official OpenAI JavaScript client dependency.
2. Add error normalization and bounded safe provider errors.
3. Add the Fireworks-compatible JSON Schema adapter with unit tests.
4. Implement `FireworksModelProvider` with dependency injection for offline testing.
5. Implement the primary/fallback provider composition and provider-factory selection.
6. Add the five minimal, secure, versioned prompt builders.
7. Update agents to pass the required typed synthetic context.
8. Update `.env.example` with placeholders only.
9. Update the frontend API guide with live/fallback semantics.
10. Test missing-key and mock-only behavior without credentials.
11. Run tests, lint, and production build.
12. Stop and ask the user to add `FIREWORKS_API_KEY` privately to `.env.local` for live verification.

Implementation followed this approved plan. Live verification must wait until the user privately configures `.env.local`.
