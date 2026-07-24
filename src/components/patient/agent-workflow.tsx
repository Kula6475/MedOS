"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Beaker,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Flame,
  ImageIcon,
  LoaderCircle,
  Pill,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"

import { PageReveal } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMockAgentResults, type AgentPhase, type MockAgentResult } from "@/lib/mock-agent-results"
import type { PatientDetail } from "@/lib/mock-patient-details"
import { cn } from "@/lib/utils"

const phases: AgentPhase[] = ["Pending", "Running", "Evaluating", "Complete"]
const agentIcons = { triage: Stethoscope, medication: Pill, labs: Beaker, imaging: ImageIcon, coordination: BrainCircuit }

const sleep = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

function PhaseTrack({ phase }: { phase: AgentPhase }) {
  const activeIndex = phases.indexOf(phase)
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-center gap-1" aria-label={`Agent status: ${phase}`}>
      {phases.map((item, index) => (
        <div key={item} className="contents">
          <div className="flex min-w-0 flex-col items-center gap-1">
            <motion.span
              animate={{ scale: index === activeIndex ? 1.12 : 1 }}
              className={cn(
                "grid size-5 place-items-center rounded-full ring-1 transition-colors",
                index < activeIndex || phase === "Complete" ? "bg-success text-success-foreground ring-success" :
                  index === activeIndex ? phase === "Evaluating" ? "bg-trust text-trust-foreground ring-trust" : "bg-primary text-primary-foreground ring-primary" :
                    "bg-muted text-muted-foreground ring-border",
              )}
            >
              {index < activeIndex || phase === "Complete" ? <Check className="size-3" /> : index === activeIndex && (phase === "Running" || phase === "Evaluating") ? <LoaderCircle className="size-3 animate-spin" /> : <Circle className="size-2 fill-current" />}
            </motion.span>
            <span className={cn("hidden text-[0.58rem] sm:block", index === activeIndex ? "font-semibold text-foreground" : "text-muted-foreground")}>{item}</span>
          </div>
          {index < phases.length - 1 && <motion.div className="h-px bg-border" animate={{ backgroundColor: index < activeIndex ? "var(--success)" : "var(--border)" }} />}
        </div>
      ))}
    </div>
  )
}

function CompletedResult({ agent, patientId }: { agent: MockAgentResult; patientId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="grid gap-3 border-t bg-background/35 p-4 lg:grid-cols-[1.15fr_1fr_0.9fr]">
        <div>
          <p className="text-label text-primary">Recommendation</p>
          <p className="mt-2 text-xs font-medium leading-5">{agent.recommendation}</p>
          <div className="mt-3 flex items-center gap-4 text-[0.67rem] text-muted-foreground">
            <span className="font-mono text-success">{agent.confidence}% confidence</span>
            <span className="flex items-center gap-1"><Clock3 className="size-3" />{agent.latency.toLocaleString()}ms</span>
          </div>
        </div>
        <div>
          <p className="text-label text-muted-foreground">Supporting evidence</p>
          <ul className="mt-2 space-y-1.5">{agent.evidence.map((evidence) => <li key={evidence} className="flex gap-2 text-[0.68rem] leading-4 text-muted-foreground"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />{evidence}</li>)}</ul>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg bg-trust/7 p-2.5 ring-1 ring-trust/18">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-trust"><ShieldCheck className="size-3" />Braintrust evaluation</span><Badge variant="trust">Mock</Badge></div>
            <div className="mt-2 flex items-end justify-between"><span className={cn("text-xs font-semibold", agent.evaluation === "Pass" ? "text-success" : "text-warning")}>{agent.evaluation}</span><span className="font-mono text-[0.65rem] text-muted-foreground">{agent.evaluationScore}/100</span></div>
            <p className="mt-1 truncate font-mono text-[0.56rem] text-muted-foreground">trace_mock_{patientId.toLowerCase()}_{agent.id}</p>
          </div>
          <div className="rounded-lg bg-provider/7 p-2.5 ring-1 ring-provider/18">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-provider"><Flame className="size-3" />Fireworks inference</span><Badge variant="replay">Mock</Badge></div>
            <p className="mt-2 truncate font-mono text-[0.62rem]">{agent.model}</p>
            <p className="mt-1 text-[0.58rem] text-muted-foreground">Simulated response · no API request</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AgentCard({ agent, phase, index, patientId }: { agent: MockAgentResult; phase: AgentPhase; index: number; patientId: string }) {
  const Icon = agentIcons[agent.id]
  const active = phase === "Running" || phase === "Evaluating"
  return (
    <motion.div layout transition={{ layout: { duration: 0.32 } }}>
      <Card aria-live="polite" className={cn("gap-0 py-0 transition-[background-color,box-shadow] duration-300", active && "bg-primary/5 shadow-float ring-primary/30", phase === "Complete" && "ring-success/22")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.span animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={active ? { repeat: Infinity, duration: 1.4 } : undefined} className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", phase === "Complete" ? "bg-success/12 text-success ring-success/20" : active ? "bg-primary/12 text-primary ring-primary/25" : "bg-muted text-muted-foreground ring-border")}><Icon className="size-4" /></motion.span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Agent {index + 1}</p><h4 className="mt-0.5 text-sm font-semibold">{agent.name}</h4></div><Badge variant={phase === "Complete" ? "success" : phase === "Evaluating" ? "trust" : phase === "Running" ? "live" : "neutral"}>{phase === "Complete" && <CheckCircle2 data-icon="inline-start" />}{phase}</Badge></div>
              <AnimatePresence mode="wait">
                <motion.p key={phase} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="mt-1 text-[0.68rem] text-muted-foreground">
                  {phase === "Pending" ? "Waiting for the previous agent" : phase === "Running" ? agent.activeMessage : phase === "Evaluating" ? agent.evaluatingMessage : "Recommendation evaluated and ready for clinician review"}
                </motion.p>
              </AnimatePresence>
              <PhaseTrack phase={phase} />
            </div>
          </div>
        </CardContent>
        <AnimatePresence>{phase === "Complete" && <CompletedResult agent={agent} patientId={patientId} />}</AnimatePresence>
      </Card>
      {index < 4 && <div className="flex h-7 items-center justify-center"><ChevronDown className={cn("size-4 transition-colors", phase === "Complete" ? "text-success" : "text-muted-foreground/35")} /></div>}
    </motion.div>
  )
}

function AgentWorkflow({ detail }: { detail: PatientDetail }) {
  const agents = useMemo(() => getMockAgentResults(detail), [detail])
  const reduceMotion = useReducedMotion()
  const [statuses, setStatuses] = useState<AgentPhase[]>(agents.map(() => "Pending"))
  const [runState, setRunState] = useState<"idle" | "running" | "complete">("idle")
  const runId = useRef(0)

  useEffect(() => () => {
    runId.current += 1
  }, [])

  async function analyzePatient() {
    const thisRun = ++runId.current
    setRunState("running")
    setStatuses(agents.map(() => "Pending"))
    const duration = reduceMotion ? 60 : 650

    for (let index = 0; index < agents.length; index += 1) {
      if (runId.current !== thisRun) return
      setStatuses((current) => current.map((status, position) => position === index ? "Running" : status))
      await sleep(duration)
      if (runId.current !== thisRun) return
      setStatuses((current) => current.map((status, position) => position === index ? "Evaluating" : status))
      await sleep(duration)
      if (runId.current !== thisRun) return
      setStatuses((current) => current.map((status, position) => position === index ? "Complete" : status))
      await sleep(reduceMotion ? 30 : 300)
    }
    if (runId.current === thisRun) setRunState("complete")
  }

  const completed = statuses.filter((status) => status === "Complete").length

  return (
    <PageReveal delay={0.08}>
      <Card className="overflow-hidden bg-gradient-to-br from-primary/7 via-card to-trust/5 py-0 ring-primary/20">
        <CardHeader className="border-b p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="neutral"><Sparkles data-icon="inline-start" />Interactive simulation</Badge><Badge variant="replay">Mock telemetry</Badge></div><CardTitle className="text-lg">Multi-agent clinical analysis</CardTitle><CardDescription className="mt-1 max-w-2xl">Watch five specialized agents review this synthetic record in sequence. All outputs, evaluations, and inference events are deterministic demo data.</CardDescription></div>
            <Button onClick={analyzePatient} disabled={runState === "running"} variant={runState === "complete" ? "outline" : "default"} size="lg">
              {runState === "running" ? <><LoaderCircle className="animate-spin" />Analyzing {completed + 1} of 5</> : runState === "complete" ? <><RotateCcw />Run analysis again</> : <><Play />Analyze Patient</>}
            </Button>
          </div>
          <AnimatePresence>{runState !== "idle" && <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mt-5 origin-left"><div className="mb-2 flex items-center justify-between text-[0.66rem] text-muted-foreground"><span>{runState === "complete" ? "Simulation complete" : "Sequential analysis in progress"}</span><span className="font-mono">{completed}/5 agents complete</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-trust" animate={{ width: `${(completed / agents.length) * 100}%` }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} /></div></motion.div>}</AnimatePresence>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">{agents.map((agent, index) => <AgentCard key={agent.id} agent={agent} phase={statuses[index]} index={index} patientId={detail.patient.id} />)}</div>
        </CardContent>
      </Card>
    </PageReveal>
  )
}

export { AgentWorkflow }
