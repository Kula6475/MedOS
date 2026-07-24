"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  AlertTriangle,
  Beaker,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  ExternalLink,
  Flame,
  ImageIcon,
  LoaderCircle,
  Pill,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Zap,
} from "lucide-react"

import { PageReveal } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMockAgentResults, type AgentPhase, type MockAgentResult } from "@/lib/mock-agent-results"
import type { PatientDetail } from "@/lib/mock-patient-details"
import type { AgentName, AgentResult, PatientAnalysis } from "@/lib/schemas"
import { cn } from "@/lib/utils"

const phases: AgentPhase[] = ["Pending", "Running", "Evaluating", "Complete"]
const agentIcons = { triage: Stethoscope, medication: Pill, labs: Beaker, imaging: ImageIcon, coordination: BrainCircuit }
const backendAgentIds: Record<AgentName, MockAgentResult["id"]> = {
  triage: "triage",
  "medication-safety": "medication",
  "lab-analysis": "labs",
  "imaging-review": "imaging",
  "care-coordination": "coordination",
}
const SIMULATED_FAILURE_INDEX = 3
const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

type DisplayAgentResult = Omit<MockAgentResult, "evaluation"> & {
  provider: "fireworks" | "mock"
  fallbackUsed: boolean
  traceId?: string
  traceUrl?: string
  evaluation: "Pass" | "Review" | "Blocked" | "Not evaluated"
}

function evaluationLabel(result: AgentResult): DisplayAgentResult["evaluation"] {
  if (result.evaluationStatus === "pass") return "Pass"
  if (result.evaluationStatus === "review") return "Review"
  if (result.evaluationStatus === "blocked") return "Blocked"
  return "Not evaluated"
}

function mergeLiveResults(
  defaults: MockAgentResult[],
  analysis: PatientAnalysis,
): DisplayAgentResult[] {
  return defaults.map((fallback) => {
    const result = analysis.agents.find((candidate) => backendAgentIds[candidate.agent] === fallback.id)
    if (!result) {
      return { ...fallback, provider: "mock", fallbackUsed: true, evaluation: "Not evaluated" }
    }
    return {
      ...fallback,
      name: result.displayName,
      recommendation: result.recommendation,
      evidence: result.evidence.map((evidence) => `${evidence.description} · ${evidence.reference}`),
      confidence: result.confidence,
      latency: result.latencyMs,
      evaluation: evaluationLabel(result),
      evaluationScore: result.evaluation?.compositeScore ?? result.confidence,
      model: result.model,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      traceId: result.traceId,
      traceUrl: result.traceUrl ?? analysis.braintrustMetadata.traceUrl,
      failureMessage: result.error?.message ?? fallback.failureMessage,
    }
  })
}

function PhaseTrack({ phase }: { phase: AgentPhase }) {
  const failed = phase === "Failed"
  const activeIndex = failed ? phases.indexOf("Running") : phases.indexOf(phase)
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-1" aria-label={`Agent status: ${phase}`}>
      {phases.map((item, index) => (
        <div key={item} className="contents">
          <div className="flex min-w-0 flex-col items-center gap-1">
            <motion.span
              animate={{ scale: index === activeIndex ? 1.12 : 1 }}
              className={cn(
                "grid size-5 place-items-center rounded-full ring-1 transition-colors",
                failed && index === activeIndex ? "bg-critical text-critical-foreground ring-critical" :
                  index < activeIndex || phase === "Complete" ? "bg-success text-success-foreground ring-success" :
                    index === activeIndex ? phase === "Evaluating" ? "bg-trust text-trust-foreground ring-trust" : "bg-primary text-primary-foreground ring-primary" :
                      "bg-muted text-muted-foreground ring-border",
              )}
            >
              {failed && index === activeIndex ? <AlertTriangle className="size-3" /> : index < activeIndex || phase === "Complete" ? <Check className="size-3" /> : index === activeIndex && (phase === "Running" || phase === "Evaluating") ? <LoaderCircle className="size-3 animate-spin" /> : <Circle className="size-2 fill-current" />}
            </motion.span>
            <span className={cn("hidden text-[0.58rem] sm:block", index === activeIndex ? "font-semibold text-foreground" : "text-muted-foreground")}>{failed && index === activeIndex ? "Failed" : item}</span>
          </div>
          {index < phases.length - 1 && <motion.div className="h-px bg-border" animate={{ backgroundColor: index < activeIndex ? "var(--success)" : "var(--border)" }} />}
        </div>
      ))}
    </div>
  )
}

function CompletedResult({ agent }: { agent: DisplayAgentResult }) {
  const evaluationVariant = agent.evaluation === "Pass" ? "success" : agent.evaluation === "Blocked" ? "critical" : "warning"
  return (
    <motion.div initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
      <div className="grid gap-3 border-t bg-background/35 p-4 lg:grid-cols-[1.15fr_1fr_0.9fr]">
        <div>
          <p className="text-label text-primary">Recommendation</p>
          <p className="mt-2 text-xs font-medium leading-5">{agent.recommendation}</p>
          <div className="mt-3 flex items-center gap-4 text-[0.67rem] text-muted-foreground">
            <span className="font-mono text-success">{agent.confidence}% evaluated confidence</span>
            <span className="flex items-center gap-1"><Clock3 className="size-3" />{agent.latency.toLocaleString()}ms</span>
          </div>
        </div>
        <div>
          <p className="text-label text-muted-foreground">Supporting evidence</p>
          <ul className="mt-2 space-y-1.5">{agent.evidence.map((evidence) => <li key={evidence} className="flex gap-2 text-[0.68rem] leading-4 text-muted-foreground"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />{evidence}</li>)}</ul>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg bg-trust/7 p-2.5 ring-1 ring-trust/18">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-trust"><ShieldCheck className="size-3" />Braintrust evaluation</span><Badge variant="trust">Live</Badge></div>
            <div className="mt-2 flex items-end justify-between"><span className={cn("text-xs font-semibold", evaluationVariant === "success" ? "text-success" : evaluationVariant === "critical" ? "text-critical" : "text-warning")}>{agent.evaluation}</span><span className="font-mono text-[0.65rem] text-muted-foreground">{agent.evaluationScore}/100</span></div>
            {agent.traceUrl ? <a href={agent.traceUrl} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 truncate font-mono text-[0.56rem] text-trust hover:underline"><ExternalLink className="size-2.5 shrink-0" />Open trace</a> : <p className="mt-1 truncate font-mono text-[0.56rem] text-muted-foreground">{agent.traceId ?? "Trace link unavailable"}</p>}
          </div>
          <div className="rounded-lg bg-provider/7 p-2.5 ring-1 ring-provider/18">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-provider"><Flame className="size-3" />Fireworks inference</span><Badge variant={agent.fallbackUsed ? "replay" : "live"}>{agent.fallbackUsed ? "Fallback" : "Live"}</Badge></div>
            <p className="mt-2 truncate font-mono text-[0.62rem]">{agent.model}</p>
            <p className="mt-1 text-[0.58rem] text-muted-foreground">{agent.provider === "fireworks" ? "Server-side structured inference" : "Deterministic demo fallback"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FailedResult({ agent, onRetry }: { agent: DisplayAgentResult; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.38 }} className="overflow-hidden">
      <div className="flex flex-col items-start justify-between gap-3 border-t bg-critical/6 p-4 sm:flex-row sm:items-center">
        <div className="flex gap-2.5"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-critical" /><div><p className="text-xs font-semibold text-critical">Agent run failed</p><p className="mt-1 text-[0.68rem] leading-4 text-muted-foreground">{agent.failureMessage}. Other available agent results remain preserved for clinician review.</p></div></div>
        <Button variant="critical" size="sm" onClick={onRetry} className="shrink-0"><RotateCcw />Retry analysis</Button>
      </div>
    </motion.div>
  )
}

function AgentCard({ agent, phase, index, onRetry }: { agent: DisplayAgentResult; phase: AgentPhase; index: number; onRetry: () => void }) {
  const Icon = agentIcons[agent.id]
  const active = phase === "Running" || phase === "Evaluating"
  const failed = phase === "Failed"
  return (
    <motion.div layout transition={{ layout: { duration: 0.32 } }}>
      <Card aria-live="polite" className={cn("gap-0 py-0 transition-[background-color,box-shadow] duration-300", active && "bg-primary/5 shadow-float ring-primary/30", phase === "Complete" && "ring-success/22", failed && "ring-critical/35")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.span animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={active ? { repeat: Infinity, duration: 1.4 } : undefined} className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", phase === "Complete" ? "bg-success/12 text-success ring-success/20" : failed ? "bg-critical/12 text-critical ring-critical/20" : active ? "bg-primary/12 text-primary ring-primary/25" : "bg-muted text-muted-foreground ring-border")}><Icon className="size-4" /></motion.span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agent {index + 1}</p><h4 className="mt-0.5 text-sm font-semibold">{agent.name}</h4></div><Badge variant={phase === "Complete" ? "success" : failed ? "critical" : phase === "Evaluating" ? "trust" : phase === "Running" ? "live" : "neutral"}>{phase === "Complete" && <CheckCircle2 data-icon="inline-start" />}{failed && <AlertTriangle data-icon="inline-start" />}{phase}</Badge></div>
              <AnimatePresence mode="wait"><motion.p key={phase} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className={cn("mt-1 text-[0.68rem]", failed ? "text-critical" : "text-muted-foreground")}>{phase === "Pending" ? index === 4 ? "Waiting for specialist outputs" : "Ready for analysis" : phase === "Running" ? agent.activeMessage : phase === "Evaluating" ? agent.evaluatingMessage : failed ? agent.failureMessage : "Recommendation evaluated and ready for clinician review"}</motion.p></AnimatePresence>
              <PhaseTrack phase={phase} />
            </div>
          </div>
        </CardContent>
        <AnimatePresence>{phase === "Complete" && <CompletedResult agent={agent} />}</AnimatePresence>
        <AnimatePresence>{failed && <FailedResult agent={agent} onRetry={onRetry} />}</AnimatePresence>
      </Card>
      {index < 4 && <div className="flex h-7 items-center justify-center"><ChevronDown className={cn("size-4 transition-colors", phase === "Complete" ? "text-success" : failed ? "text-critical" : "text-muted-foreground/35")} /></div>}
    </motion.div>
  )
}

function AgentWorkflow({ detail }: { detail: PatientDetail }) {
  const defaults = useMemo(() => getMockAgentResults(detail), [detail])
  const reduceMotion = useReducedMotion()
  const [agents, setAgents] = useState<DisplayAgentResult[]>(() => defaults.map((agent) => ({ ...agent, provider: "mock", fallbackUsed: true })))
  const [statuses, setStatuses] = useState<AgentPhase[]>(defaults.map(() => "Pending"))
  const [runState, setRunState] = useState<"idle" | "running" | "failed" | "complete">("idle")
  const [analysis, setAnalysis] = useState<PatientAnalysis | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const runId = useRef(0)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => {
    runId.current += 1
    controller.current?.abort()
  }, [])

  async function analyzePatient() {
    const thisRun = ++runId.current
    controller.current?.abort()
    controller.current = new AbortController()
    setAnalysis(null)
    setRequestError(null)
    setRunState("running")
    setAgents(defaults.map((agent) => ({ ...agent, provider: "mock", fallbackUsed: true })))
    setStatuses(["Running", "Running", "Running", "Running", "Pending"])

    const evaluationTimer = window.setTimeout(() => {
      if (runId.current === thisRun) setStatuses(["Evaluating", "Evaluating", "Evaluating", "Evaluating", "Pending"])
    }, reduceMotion ? 100 : 900)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: detail.patient.id }),
        signal: controller.current.signal,
      })
      const payload: unknown = await response.json()
      if (!response.ok || !payload || typeof payload !== "object" || !("agents" in payload)) {
        const message = payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object" && "message" in payload.error ? String(payload.error.message) : "Analysis service could not complete the request."
        throw new Error(message)
      }
      if (runId.current !== thisRun) return
      const liveAnalysis = payload as PatientAnalysis
      const liveAgents = mergeLiveResults(defaults, liveAnalysis)
      setAgents(liveAgents)
      const specialistStatuses: AgentPhase[] = liveAnalysis.agents
        .filter((result) => result.agent !== "care-coordination")
        .map((result) => result.status === "failed" ? "Failed" : "Complete")
      setStatuses([...specialistStatuses, "Running"])
      await sleep(reduceMotion ? 80 : 450)
      if (runId.current !== thisRun) return
      setStatuses((current) => current.map((status, index) => index === 4 ? "Evaluating" : status))
      await sleep(reduceMotion ? 80 : 450)
      if (runId.current !== thisRun) return
      const coordination = liveAnalysis.agents.find((result) => result.agent === "care-coordination")
      setStatuses((current) => current.map((status, index) => index === 4 ? coordination?.status === "failed" ? "Failed" : "Complete" : status))
      setAnalysis(liveAnalysis)
      setRunState(liveAnalysis.agents.some((result) => result.status === "failed") ? "failed" : "complete")
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return
      if (runId.current !== thisRun) return
      setRequestError(caught instanceof Error ? caught.message : "Analysis service could not complete the request.")
      setStatuses((current) => current.map((status) => status === "Pending" ? status : "Failed"))
      setRunState("failed")
    } finally {
      window.clearTimeout(evaluationTimer)
    }
  }

  async function previewFailure() {
    const thisRun = ++runId.current
    controller.current?.abort()
    setAnalysis(null)
    setRequestError(null)
    setRunState("running")
    setAgents(defaults.map((agent) => ({ ...agent, provider: "mock", fallbackUsed: true })))
    setStatuses(defaults.map(() => "Pending"))
    for (let index = 0; index <= SIMULATED_FAILURE_INDEX; index += 1) {
      if (runId.current !== thisRun) return
      setStatuses((current) => current.map((status, position) => position === index ? "Running" : status))
      await sleep(reduceMotion ? 50 : 300)
      if (index === SIMULATED_FAILURE_INDEX) {
        setStatuses((current) => current.map((status, position) => position === index ? "Failed" : status))
        setRunState("failed")
        return
      }
      setStatuses((current) => current.map((status, position) => position === index ? "Complete" : status))
    }
  }

  const completed = statuses.filter((status) => status === "Complete").length

  return (
    <PageReveal delay={0.08}>
      <Card className="overflow-hidden bg-gradient-to-br from-primary/7 via-card to-trust/5 py-0 ring-primary/20">
        <CardHeader className="border-b p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="live"><Sparkles data-icon="inline-start" />Live agent workflow</Badge><Badge variant="trust"><ShieldCheck data-icon="inline-start" />Braintrust monitored</Badge></div><CardTitle className="text-lg">Multi-agent clinical analysis</CardTitle><CardDescription className="mt-1 max-w-2xl">Four specialist agents run concurrently through Fireworks. Care Coordination then synthesizes their validated outputs, while Braintrust records evaluations and trace metadata.</CardDescription></div>
            <div className="flex flex-wrap items-center gap-2">
              {runState !== "running" && <Button onClick={previewFailure} variant="ghost" size="sm" className="text-muted-foreground" aria-label="Preview a partial agent failure"><Zap />Preview failure UI</Button>}
              <Button onClick={analyzePatient} disabled={runState === "running"} variant={runState === "complete" || runState === "failed" ? "outline" : "default"} size="lg">{runState === "running" ? <><LoaderCircle className="animate-spin" />Running live analysis</> : runState === "complete" || runState === "failed" ? <><RotateCcw />Run analysis again</> : <><Play />Analyze Patient</>}</Button>
            </div>
          </div>
          <AnimatePresence>{requestError && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 rounded-lg bg-critical/8 px-3 py-2.5 text-xs font-medium text-critical ring-1 ring-critical/20"><AlertTriangle className="size-3.5 shrink-0" />{requestError} The synthetic record remains available; retry when providers are ready.</motion.div>}</AnimatePresence>
          <AnimatePresence>{runState !== "idle" && <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mt-5 origin-left"><div className="mb-2 flex items-center justify-between text-[0.66rem] text-muted-foreground"><span>{runState === "complete" ? "Live analysis complete" : runState === "failed" ? "Partial or failed analysis — review required" : "Specialists analyzing concurrently"}</span><span className="font-mono">{completed}/5 agents complete</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className={cn("h-full rounded-full", runState === "failed" ? "bg-critical" : "bg-gradient-to-r from-primary to-trust")} animate={{ width: `${(completed / agents.length) * 100}%` }} transition={{ duration: 0.4 }} /></div></motion.div>}</AnimatePresence>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">{agents.map((agent, index) => <AgentCard key={agent.id} agent={agent} phase={statuses[index]} index={index} onRetry={analyzePatient} />)}</div>
          <AnimatePresence>{analysis && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-6 max-w-5xl rounded-xl bg-trust/7 p-5 ring-1 ring-trust/20"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-label text-trust">Safety-gated coordinated result</p><p className="mt-2 max-w-3xl text-sm font-semibold leading-6">{analysis.finalRecommendation}</p></div><Badge variant={analysis.overallRisk === "critical" ? "critical" : "warning"}>{analysis.overallRisk} risk</Badge></div><p className="mt-3 text-[0.68rem] leading-5 text-muted-foreground">{analysis.disclaimer}</p>{analysis.braintrustMetadata.traceUrl && <a href={analysis.braintrustMetadata.traceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-trust hover:underline"><ExternalLink className="size-3.5" />Inspect the Braintrust trace</a>}</motion.div>}</AnimatePresence>
        </CardContent>
      </Card>
    </PageReveal>
  )
}

export { AgentWorkflow }
