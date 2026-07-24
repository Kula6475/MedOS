import type { ExperimentLogPartialArgs, StartSpanArgs } from "braintrust"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getPatientRecordById } from "@/data/patients"
import { runAnalysis } from "@/lib/orchestrator"
import { braintrustEvaluationSchema, patientAnalysisSchema, type AgentName } from "@/lib/schemas"

import {
  BraintrustObservabilityProvider,
  evaluationToBraintrustScores,
  maskBraintrustValue,
  normalizeBraintrustScore,
  type BraintrustLoggerLike,
  type BraintrustSpanLike,
} from "./braintrust-observability-provider"
import { LocalObservabilityProvider } from "./local-observability-provider"
import { MockModelProvider } from "./mock-model-provider"
import type { ModelProvider, ModelProviderRequest, ModelProviderResult } from "./model-provider"
import { createObservabilityProvider } from "./provider-factory"

class FakeSpan implements BraintrustSpanLike {
  readonly children: FakeSpan[] = []
  readonly events: ExperimentLogPartialArgs[] = []
  ended = 0

  constructor(
    readonly name: string,
    readonly spanId: string,
    readonly rootSpanId: string,
    readonly args: StartSpanArgs,
    private readonly failLogging = false,
  ) {}

  startSpan(args: StartSpanArgs = {}): FakeSpan {
    const child = new FakeSpan(
      args.name ?? "child",
      `span-${this.children.length + 1}-${this.spanId}`,
      this.rootSpanId,
      args,
      this.failLogging,
    )
    this.children.push(child)
    return child
  }

  log(event: ExperimentLogPartialArgs): void {
    if (this.failLogging) throw new Error("simulated Braintrust logging failure")
    this.events.push(event)
  }

  end(): number {
    this.ended += 1
    return Date.now() / 1_000
  }

  link(): string {
    return `https://www.braintrust.dev/app/test/${this.rootSpanId}`
  }
}

class FakeLogger implements BraintrustLoggerLike {
  readonly roots: FakeSpan[] = []
  flushCount = 0

  constructor(
    private readonly failLogging = false,
    private readonly failFlush = false,
  ) {}

  startSpan(args: StartSpanArgs = {}): FakeSpan {
    const id = `root-${this.roots.length + 1}`
    const root = new FakeSpan(args.name ?? "root", id, id, args, this.failLogging)
    this.roots.push(root)
    return root
  }

  async flush(): Promise<void> {
    this.flushCount += 1
    if (this.failFlush) throw new Error("simulated Braintrust flush failure")
  }
}

function provider(logger = new FakeLogger()) {
  return {
    logger,
    observability: new BraintrustObservabilityProvider({
      apiKey: "test-key-never-logged",
      projectName: "MedOS Test",
      logger,
      maskingSetter: () => undefined,
    }),
  }
}

function allLoggedEvents(root: FakeSpan): ExperimentLogPartialArgs[] {
  return [root, ...root.children].flatMap((span) => [span.args.event ?? {}, ...span.events])
}

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined)
  vi.spyOn(console, "error").mockImplementation(() => undefined)
  vi.spyOn(console, "warn").mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Braintrust provider selection", () => {
  it("defaults to local observability", () => {
    expect(createObservabilityProvider({ env: {} })).toBeInstanceOf(LocalObservabilityProvider)
  })

  it("falls back locally when the Braintrust key is missing", () => {
    const selected = createObservabilityProvider({
      env: { OBSERVABILITY_PROVIDER: "braintrust", BRAINTRUST_API_KEY: "" },
    })
    expect(selected).toBeInstanceOf(LocalObservabilityProvider)
  })

  it("falls back locally when Braintrust initialization fails", () => {
    const selected = createObservabilityProvider({
      env: { OBSERVABILITY_PROVIDER: "braintrust", BRAINTRUST_API_KEY: "configured" },
      braintrustFactory: () => {
        throw new Error("simulated initialization failure")
      },
    })
    expect(selected).toBeInstanceOf(LocalObservabilityProvider)
  })
})

describe("Braintrust trace lifecycle", () => {
  it("creates one root and exactly five direct agent children, then ends and flushes them", async () => {
    const { logger, observability } = provider()
    const result = await runAnalysis({
      patientId: "MED-1042",
      modelProvider: new MockModelProvider(),
      observability,
    })

    expect(result.ok).toBe(true)
    expect(logger.roots).toHaveLength(1)
    const root = logger.roots[0]
    expect(root.name).toBe("patient-analysis")
    expect(root.args.type).toBe("task")
    expect(root.children.map((span) => span.name)).toEqual([
      "triage-agent",
      "medication-safety-agent",
      "lab-analysis-agent",
      "imaging-review-agent",
      "care-coordination-agent",
    ])
    expect(root.children.every((span) => span.children.length === 0)).toBe(true)
    expect(root.children.every((span) => span.ended === 1)).toBe(true)
    expect(root.ended).toBe(1)
    expect(logger.flushCount).toBe(1)
    if (result.ok) expect(patientAnalysisSchema.safeParse(result.analysis).success).toBe(true)
  })

  it("ends a failed child and preserves the rest of the trace", async () => {
    const delegate = new MockModelProvider()
    const partialFailureProvider: ModelProvider = {
      name: "mock",
      async generate<TOutput>(request: ModelProviderRequest<TOutput>): Promise<ModelProviderResult<TOutput>> {
        if (request.agent === "lab-analysis") throw new Error("simulated lab agent failure")
        return delegate.generate(request)
      },
    }
    const { logger, observability } = provider()
    const result = await runAnalysis({
      patientId: "MED-1042",
      modelProvider: partialFailureProvider,
      observability,
    })

    expect(result.ok).toBe(true)
    const root = logger.roots[0]
    expect(root.children).toHaveLength(5)
    expect(root.children.every((span) => span.ended === 1)).toBe(true)
    expect(root.ended).toBe(1)
    const lab = root.children.find((span) => span.name === "lab-analysis-agent")!
    expect(JSON.stringify(lab.events)).toContain('"completionStatus":"failed"')
    expect(JSON.stringify(lab.events)).toContain('"categorizedError":"agent_execution_error"')
  })

  it("does not let Braintrust logging or flush failures break PatientAnalysis", async () => {
    const logger = new FakeLogger(true, true)
    const { observability } = provider(logger)
    const result = await runAnalysis({
      patientId: "MED-1042",
      modelProvider: new MockModelProvider(),
      observability,
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(patientAnalysisSchema.safeParse(result.analysis).success).toBe(true)
    expect(logger.roots[0].children).toHaveLength(5)
    expect(logger.roots[0].children.every((span) => span.ended === 1)).toBe(true)
    expect(logger.roots[0].ended).toBe(1)
    expect(logger.flushCount).toBe(1)
  })
})

describe("Braintrust evaluation logging", () => {
  const evaluation = braintrustEvaluationSchema.parse({
    scores: {
      evidenceGrounding: 100,
      safetyCompliance: 80,
      criticalFindingCoverage: 50,
      completeness: 0,
      crossAgentConsistency: 100,
    },
    compositeScore: 75,
    status: "review",
    hardFailures: [],
    checks: [
      "schema-validity",
      "evidence-grounding",
      "unsupported-claims",
      "safety-language",
      "completeness",
      "role-compliance",
      "coordinator-consistency",
      "latency",
    ].map((name) => ({ name, score: 100, passed: true, hardFailure: false, message: "deterministic check" })),
  })

  it("normalizes and clamps internal scores to Braintrust's zero-to-one range", () => {
    expect(normalizeBraintrustScore(-10)).toBe(0)
    expect(normalizeBraintrustScore(50)).toBe(0.5)
    expect(normalizeBraintrustScore(150)).toBe(1)
    expect(normalizeBraintrustScore(Number.NaN)).toBe(0)

    const scores = evaluationToBraintrustScores({
      ...evaluation,
      scores: { ...evaluation.scores, crossAgentConsistency: 100 },
    })
    expect(scores.evidenceGrounding).toBe(1)
    expect(scores.safetyCompliance).toBe(0.8)
    expect(scores["schema-validity"]).toBe(1)
    expect(scores.compositeScore).toBe(0.75)
    expect(Object.values(scores).every((score) => score >= 0 && score <= 1)).toBe(true)
  })

  it("marks logged evaluations as deterministic safety heuristics, not clinical accuracy", () => {
    const { logger, observability } = provider()
    const trace = observability.startAnalysisTrace({ analysisId: "analysis-test", patientId: "MED-1042" })
    const span = observability.startAgentSpan(trace, { agent: "triage", patientId: "MED-1042" })
    observability.recordEvaluation(span, {
      ...evaluation,
      scores: { ...evaluation.scores, crossAgentConsistency: 100 },
    })

    const event = logger.roots[0].children[0].events.at(-1)!
    expect(event.metadata).toMatchObject({
      evaluationMethod: "deterministic_safety_heuristics",
      clinicalAccuracyScore: false,
    })
    expect(event.scores?.["schema-validity"]).toBe(1)
  })
})

describe("Braintrust privacy filtering", () => {
  it("allows only approved operational metadata and excludes raw patient data", () => {
    const { logger, observability } = provider()
    const trace = observability.startAnalysisTrace({ analysisId: "analysis-test", patientId: "MED-1042" })
    observability.recordMetadata(trace, {
      workflowVersion: "workflow@1",
      totalLatencyMs: 42,
      patientName: "RAW-NAME-MUST-NOT-LOG",
      dateOfBirth: "RAW-DOB-MUST-NOT-LOG",
      physicianNotes: "RAW-NOTES-MUST-NOT-LOG",
      medications: ["RAW-MEDICATION-MUST-NOT-LOG"],
    })
    const agent = observability.startAgentSpan(trace, {
      agent: "imaging-review" as AgentName,
      patientId: "MED-1042",
    })
    observability.recordMetadata(agent, {
      provider: "fireworks",
      model: "synthetic-model",
      evidenceReferenceCount: 2,
      findingCount: 1,
      rawPatientRecord: "RAW-PATIENT-MUST-NOT-LOG",
      imagingText: "RAW-IMAGING-MUST-NOT-LOG",
      apiKey: "SECRET-MUST-NOT-LOG",
    })

    const serialized = JSON.stringify(allLoggedEvents(logger.roots[0]))
    expect(serialized).toContain("workflowVersion")
    expect(serialized).toContain("evidenceReferenceCount")
    for (const forbidden of [
      "RAW-NAME-MUST-NOT-LOG",
      "RAW-DOB-MUST-NOT-LOG",
      "RAW-NOTES-MUST-NOT-LOG",
      "RAW-MEDICATION-MUST-NOT-LOG",
      "RAW-PATIENT-MUST-NOT-LOG",
      "RAW-IMAGING-MUST-NOT-LOG",
      "SECRET-MUST-NOT-LOG",
    ]) {
      expect(serialized).not.toContain(forbidden)
    }
  })

  it("masks nested credential-like values as defense in depth", () => {
    const masked = maskBraintrustValue({
      safe: "visible",
      apiKey: "secret-value",
      nested: [{ authorization: "Bearer secret-value", safe: "still-visible" }],
    })
    const serialized = JSON.stringify(masked)
    expect(serialized).not.toContain("secret-value")
    expect(serialized).toContain("[redacted]")
    expect(serialized).toContain("still-visible")
  })

  it("never logs the synthetic patient's raw record through normal analysis metadata", async () => {
    const patient = getPatientRecordById("MED-1042")!
    const { logger, observability } = provider()
    const result = await runAnalysis({ patientId: patient.id, modelProvider: new MockModelProvider(), observability })

    expect(result.ok).toBe(true)
    const serialized = JSON.stringify(allLoggedEvents(logger.roots[0]))
    expect(serialized).not.toContain(patient.demographics.name)
    expect(serialized).not.toContain(patient.notes[0].text)
    expect(serialized).not.toContain(patient.medications[0].name)
    expect(serialized).not.toContain(patient.imaging[0].findings)
  })
})
