"use client"

import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  Gauge,
  HeartPulse,
  ShieldCheck,
  Siren,
  UsersRound,
  Zap,
} from "lucide-react"

import { AnimatedNumber, MetricCard } from "@/components/dashboard/animated-metric"
import { PatientQueue } from "@/components/dashboard/patient-queue"
import { PageReveal, StatusPulse } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  agentStatus,
  departmentMetrics,
  emergencyAlerts,
  hospitalUtilization,
  inferenceStatus,
  observabilityMetrics,
  syntheticPatients,
} from "@/lib/mock-hospital-data"
import { cn } from "@/lib/utils"

const criticalPatientCount = syntheticPatients.filter((patient) => patient.acuity === "ESI 1").length

const barTone = { primary: "bg-primary", warning: "bg-warning", info: "bg-info", trust: "bg-trust" }

function UtilizationPanel() {
  const reduceMotion = useReducedMotion()
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Hospital utilization</CardTitle>
        <CardDescription>Capacity across operational units</CardDescription>
        <CardAction><Badge variant="warning">High census</Badge></CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        {hospitalUtilization.map((unit, index) => (
          <div key={unit.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">{unit.label}</span>
              <span className="font-mono text-muted-foreground">{unit.detail} · <AnimatedNumber value={unit.value} suffix="%" /></span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div className={cn("h-full rounded-full", barTone[unit.tone])} initial={reduceMotion ? { width: `${unit.value}%` } : { width: 0 }} animate={{ width: `${unit.value}%` }} transition={{ duration: reduceMotion ? 0 : 0.8, delay: 0.35 + index * 0.08, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function AlertPanel() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Emergency alerts</CardTitle><CardDescription>Requires team awareness</CardDescription><CardAction><Badge variant="critical">4 active</Badge></CardAction></CardHeader>
      <CardContent className="space-y-1">
        {emergencyAlerts.map((alert, index) => (
          <motion.div key={alert.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + index * 0.06 }} className="flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/45">
            <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-md", alert.tone === "critical" ? "bg-critical/12 text-critical" : alert.tone === "warning" ? "bg-warning/12 text-warning" : "bg-info/12 text-info")}><AlertTriangle className="size-3.5" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{alert.title}</p><p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">{alert.detail}</p></div>
            <span className="text-[0.65rem] text-muted-foreground">{alert.time}</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

function AgentPanel() {
  const reduceMotion = useReducedMotion()
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Agent overview</CardTitle><CardDescription>Five coordinated clinical support agents</CardDescription><CardAction><Badge variant="replay">Demo state</Badge></CardAction></CardHeader>
      <CardContent className="space-y-1">
        {agentStatus.map((agent, index) => (
          <div key={agent.name} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted/35">
            <div className="min-w-0"><div className="flex items-center gap-2"><StatusPulse tone={agent.status === "Idle" ? "info" : agent.status === "Reviewing" ? "warning" : "success"} /><span className="truncate text-xs font-medium">{agent.name}</span></div><p className="mt-1 pl-4 text-[0.66rem] text-muted-foreground">{agent.status} · {agent.runs} runs</p></div>
            <div className="w-20 text-right"><p className="font-mono text-xs font-semibold text-success"><AnimatedNumber value={agent.confidence} suffix="%" /></p><div className="mt-1 h-1 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-success" initial={reduceMotion ? { width: `${agent.confidence}%` } : { width: 0 }} animate={{ width: `${agent.confidence}%` }} transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.4 + index * 0.07 }} /></div></div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ObservabilityPanel() {
  return (
    <Card variant="trust" className="h-full bg-gradient-to-br from-trust/10 via-card to-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-trust" />Braintrust observability</CardTitle><CardDescription>Mock evaluation health · last 60 minutes</CardDescription><CardAction><Badge variant="replay">Mock data</Badge></CardAction></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-background/40 p-3 ring-1 ring-border"><p className="text-[0.65rem] text-muted-foreground">Evaluated runs</p><p className="mt-1 font-mono text-lg font-semibold"><AnimatedNumber value={observabilityMetrics.evaluatedRuns} /></p></div>
          <div className="rounded-lg bg-background/40 p-3 ring-1 ring-border"><p className="text-[0.65rem] text-muted-foreground">Evaluation pass</p><p className="mt-1 font-mono text-lg font-semibold text-success"><AnimatedNumber value={observabilityMetrics.passRate} decimals={1} suffix="%" /></p></div>
          <div className="rounded-lg bg-background/40 p-3 ring-1 ring-border"><p className="text-[0.65rem] text-muted-foreground">Traces available</p><p className="mt-1 font-mono text-lg font-semibold"><AnimatedNumber value={observabilityMetrics.tracesAvailable} /></p></div>
          <div className="rounded-lg bg-background/40 p-3 ring-1 ring-border"><p className="text-[0.65rem] text-muted-foreground">Flagged for review</p><p className="mt-1 font-mono text-lg font-semibold text-warning"><AnimatedNumber value={observabilityMetrics.flaggedForReview} /></p></div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-trust/8 px-3 py-2.5 text-xs ring-1 ring-trust/15"><span className="flex items-center gap-2 text-trust"><CheckCircle2 className="size-3.5" />All traces available</span><Button variant="ghost" size="xs" render={<Link href="/trust" />}>Open traces <ExternalLink /></Button></div>
      </CardContent>
    </Card>
  )
}

function InferencePanel() {
  return (
    <Card className="h-full bg-gradient-to-br from-provider/7 via-card to-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="size-4 text-provider" />Fireworks inference</CardTitle><CardDescription>Mock provider status</CardDescription><CardAction><Badge variant="replay">Mock operational</Badge></CardAction></CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-lg bg-background/40 p-3 ring-1 ring-border"><span className="grid size-9 place-items-center rounded-lg bg-provider/12 text-provider"><Zap className="size-4" /></span><div className="min-w-0"><p className="truncate font-mono text-xs font-medium">{inferenceStatus.model}</p><p className="mt-0.5 text-[0.66rem] text-muted-foreground">{inferenceStatus.region} · high-performance inference</p></div></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><p className="font-mono text-base font-semibold"><AnimatedNumber value={inferenceStatus.p50Latency} suffix="ms" /></p><p className="text-[0.62rem] text-muted-foreground">p50 latency</p></div><div><p className="font-mono text-base font-semibold"><AnimatedNumber value={inferenceStatus.requestsThisHour} /></p><p className="text-[0.62rem] text-muted-foreground">requests</p></div><div><p className="font-mono text-base font-semibold text-success"><AnimatedNumber value={inferenceStatus.uptime} decimals={2} suffix="%" /></p><p className="text-[0.62rem] text-muted-foreground">uptime</p></div></div>
        <p className="mt-4 border-t pt-3 text-center text-[0.65rem] font-medium text-muted-foreground">Fireworks powers the intelligence; Braintrust builds trust.</p>
      </CardContent>
    </Card>
  )
}

function OperationsDashboard() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-section pb-8">
      <PageReveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2"><Badge variant="replay">Synthetic replay</Badge><span className="text-xs text-muted-foreground">Demo snapshot</span></div><h2 className="text-title">Good morning, Dr. Morgan</h2><p className="mt-1 text-sm text-muted-foreground">Emergency department status for Thursday, July 23 · Day shift</p></div>
        <div className="flex items-center gap-2 rounded-lg bg-card/75 px-3 py-2 text-xs ring-1 ring-border"><Activity className="size-4 text-primary" /><span className="text-muted-foreground">Department state</span><span className="font-medium text-warning">High census</span></div>
      </PageReveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
        <MetricCard label="Active patients" value={departmentMetrics.activePatients} helper={`of ${departmentMetrics.capacity} capacity`} trend="+6 this hour" icon={UsersRound} delay={0.04} />
        <MetricCard label="Critical patients" value={criticalPatientCount} helper="ESI 1 · immediate" icon={Siren} tone="critical" delay={0.06} />
        <MetricCard label="ICU beds available" value={departmentMetrics.icuBedsAvailable} helper={`of ${departmentMetrics.icuBedsTotal} total`} icon={BedDouble} tone="warning" delay={0.08} />
        <MetricCard label="Emergency alerts" value={departmentMetrics.emergencyAlerts} helper="2 high priority" icon={AlertTriangle} tone="critical" delay={0.12} />
        <MetricCard label="Average wait" value={departmentMetrics.averageWaitMinutes} suffix="m" helper="door to clinician" trend="↓ 4m" icon={Clock3} tone="info" delay={0.16} />
        <MetricCard label="Hospital utilization" value={departmentMetrics.hospitalUtilization} suffix="%" helper="across staffed beds" icon={Gauge} tone="trust" delay={0.2} />
        <MetricCard label="Arrivals this shift" value={departmentMetrics.arrivalsThisShift} helper="since 07:00" trend="+12%" icon={HeartPulse} tone="success" delay={0.24} />
      </div>

      <div className="grid gap-section xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.65fr)]"><PageReveal delay={0.22}><PatientQueue /></PageReveal><div className="grid gap-section sm:grid-cols-2 xl:grid-cols-1"><PageReveal delay={0.28}><AlertPanel /></PageReveal><PageReveal delay={0.32}><UtilizationPanel /></PageReveal></div></div>
      <div className="grid gap-section lg:grid-cols-3"><PageReveal delay={0.34}><AgentPanel /></PageReveal><PageReveal delay={0.38}><ObservabilityPanel /></PageReveal><PageReveal delay={0.42}><InferencePanel /></PageReveal></div>

      <PageReveal delay={0.46} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground"><span>All patient names and clinical records shown are synthetic.</span><span>MedOS is clinical decision support—not medical advice or autonomous care.</span></PageReveal>
    </div>
  )
}

export { OperationsDashboard }
