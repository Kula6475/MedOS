"use client"

import { useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import {
  Activity,
  BedDouble,
  BrainCircuit,
  Clock3,
  Flame,
  Gauge,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react"

import { AnimatedNumber, MetricCard } from "@/components/dashboard/animated-metric"
import { PageReveal } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  agentAnalytics,
  braintrustHistory,
  emergencyTrends,
  fireworksLatency,
  fireworksMetrics,
  headlineAnalytics,
  throughputByRange,
  utilizationUnits,
  type AnalyticsRange,
} from "@/lib/mock-analytics-data"
import { cn } from "@/lib/utils"

function ThroughputChart() {
  const [range, setRange] = useState<AnalyticsRange>("7d")
  const data = throughputByRange[range]
  const max = Math.max(...data.flatMap((point) => [point.arrivals, point.discharged]))
  const maxWait = Math.max(...data.map((point) => point.wait))

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Patient throughput & wait time</CardTitle><CardDescription>Arrivals, discharges, and door-to-clinician time</CardDescription><CardAction><div className="flex rounded-lg bg-muted p-0.5">{(["24h", "7d", "30d"] as const).map((item) => <Button key={item} size="xs" variant={range === item ? "secondary" : "ghost"} onClick={() => setRange(item)}>{item}</Button>)}</div></CardAction></CardHeader>
      <CardContent>
        <div className="mb-5 flex flex-wrap gap-4 text-[0.68rem] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-primary" />Arrivals</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-info" />Discharged</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-warning" />Average wait</span></div>
        <AnimatePresence mode="wait"><motion.div key={range} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-64 items-end gap-2 sm:gap-4">{data.map((point, index) => <div key={point.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="relative flex flex-1 items-end justify-center gap-1 rounded-t-md bg-muted/12 px-1"><motion.div title={`${point.arrivals} arrivals`} initial={{ height: 0 }} animate={{ height: `${(point.arrivals / max) * 82}%` }} transition={{ delay: index * 0.05, duration: 0.55 }} className="w-3 rounded-t-sm bg-primary/85 transition-colors group-hover:bg-primary sm:w-5" /><motion.div title={`${point.discharged} discharges`} initial={{ height: 0 }} animate={{ height: `${(point.discharged / max) * 82}%` }} transition={{ delay: 0.06 + index * 0.05, duration: 0.55 }} className="w-3 rounded-t-sm bg-info/75 transition-colors group-hover:bg-info sm:w-5" /><motion.div title={`${point.wait} minute wait`} initial={{ bottom: 0, opacity: 0 }} animate={{ bottom: `${(point.wait / maxWait) * 75}%`, opacity: 1 }} transition={{ delay: 0.15 + index * 0.05 }} className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-warning ring-4 ring-warning/15" /><div className="pointer-events-none absolute top-2 left-1/2 z-10 hidden w-28 -translate-x-1/2 rounded-lg bg-popover p-2 text-center text-[0.62rem] shadow-float ring-1 ring-border group-hover:block"><p>{point.arrivals} arrivals</p><p>{point.discharged} discharged</p><p>{point.wait}m wait</p></div></div><span className="mt-2 text-center text-[0.62rem] text-muted-foreground">{point.label}</span></div>)}</motion.div></AnimatePresence>
      </CardContent>
    </Card>
  )
}

function UtilizationChart() {
  return (
    <Card className="h-full"><CardHeader><CardTitle>Hospital utilization</CardTitle><CardDescription>Staffed capacity by care setting</CardDescription><CardAction><Badge variant="warning">81% overall</Badge></CardAction></CardHeader><CardContent><div className="flex items-center gap-6"><div className="relative hidden size-32 shrink-0 place-items-center rounded-full sm:grid" style={{ background: `conic-gradient(var(--primary) 0 81%, var(--muted) 81% 100%)` }}><div className="grid size-24 place-items-center rounded-full bg-card text-center"><div><p className="font-mono text-2xl font-semibold">81%</p><p className="text-[0.6rem] text-muted-foreground">overall</p></div></div></div><div className="min-w-0 flex-1 space-y-4">{utilizationUnits.map((unit, index) => <div key={unit.label}><div className="mb-1.5 flex items-center justify-between gap-2 text-[0.68rem]"><span className="font-medium">{unit.label}</span><span className="font-mono text-muted-foreground">{unit.beds} · {unit.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${unit.value}%` }} transition={{ duration: 0.7, delay: 0.18 + index * 0.07 }} className={cn("h-full rounded-full", unit.tone)} /></div></div>)}</div></div></CardContent></Card>
  )
}

function EmergencyTrendChart() {
  const max = Math.max(...emergencyTrends.map((day) => day.esi1 + day.esi2 + day.esi3 + day.esi4))
  return (
    <Card className="h-full"><CardHeader><CardTitle>Emergency trends</CardTitle><CardDescription>Seven-day arrivals by Emergency Severity Index</CardDescription><CardAction><Badge variant="critical">ESI 1 +14%</Badge></CardAction></CardHeader><CardContent><div className="mb-4 flex flex-wrap gap-3 text-[0.62rem] text-muted-foreground"><span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-critical" />ESI 1</span><span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-warning" />ESI 2</span><span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-info" />ESI 3</span><span className="flex items-center gap-1"><i className="size-2 rounded-sm bg-muted-foreground" />ESI 4</span></div><div className="flex h-52 items-end gap-3">{emergencyTrends.map((day, index) => { const total = day.esi1 + day.esi2 + day.esi3 + day.esi4; return <div key={day.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><motion.div title={`${total} arrivals`} initial={{ height: 0 }} animate={{ height: `${(total / max) * 100}%` }} transition={{ duration: 0.65, delay: index * 0.06 }} className="relative flex w-full flex-col-reverse overflow-hidden rounded-t-md ring-1 ring-border"><div style={{ height: `${(day.esi4 / total) * 100}%` }} className="bg-muted-foreground/55" /><div style={{ height: `${(day.esi3 / total) * 100}%` }} className="bg-info/75" /><div style={{ height: `${(day.esi2 / total) * 100}%` }} className="bg-warning/85" /><div style={{ height: `${(day.esi1 / total) * 100}%` }} className="bg-critical" /><div className="pointer-events-none absolute inset-x-1 top-2 hidden rounded bg-popover/95 p-1.5 text-center text-[0.6rem] shadow-float group-hover:block">{total} arrivals<br />{day.esi1} critical</div></motion.div><span className="mt-2 text-center text-[0.62rem] text-muted-foreground">{day.label}</span></div>})}</div></CardContent></Card>
  )
}

function AgentPerformance() {
  const [selected, setSelected] = useState(0)
  const agent = agentAnalytics[selected]
  return (
    <Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="size-4 text-primary" />Agent performance</CardTitle><CardDescription>Simulated quality and responsiveness metrics</CardDescription><CardAction><Badge variant="replay">Synthetic</Badge></CardAction></CardHeader><CardContent><div className="space-y-1">{agentAnalytics.map((item, index) => <button key={item.name} onClick={() => setSelected(index)} className={cn("grid w-full grid-cols-[8rem_1fr_auto] items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors", selected === index ? "bg-primary/8 ring-1 ring-primary/16" : "hover:bg-muted/35")}><span className="truncate text-[0.68rem] font-medium">{item.name}</span><span className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.span className="block h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${item.passRate}%` }} /></span><span className="w-10 text-right font-mono text-[0.66rem]">{item.passRate}%</span></button>)}</div><AnimatePresence mode="wait"><motion.div key={agent.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-4 gap-2 rounded-lg bg-muted/25 p-3 text-center"><div><p className="font-mono text-sm font-semibold">{agent.runs}</p><p className="text-[0.58rem] text-muted-foreground">runs</p></div><div><p className="font-mono text-sm font-semibold text-success">{agent.confidence}%</p><p className="text-[0.58rem] text-muted-foreground">confidence</p></div><div><p className="font-mono text-sm font-semibold">{agent.latency}ms</p><p className="text-[0.58rem] text-muted-foreground">latency</p></div><div><p className="font-mono text-sm font-semibold text-trust">{agent.evidence}%</p><p className="text-[0.58rem] text-muted-foreground">evidence</p></div></motion.div></AnimatePresence></CardContent></Card>
  )
}

function BraintrustHistory() {
  const max = Math.max(...braintrustHistory.map((day) => day.pass + day.review + day.blocked))
  return (
    <Card variant="trust" className="h-full bg-gradient-to-br from-trust/9 via-card to-card"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-trust" />Braintrust evaluation history</CardTitle><CardDescription>Mock evaluator outcomes · seven days</CardDescription><CardAction><Badge variant="trust">96.8% pass</Badge></CardAction></CardHeader><CardContent><div className="space-y-3">{braintrustHistory.map((day, index) => { const total = day.pass + day.review + day.blocked; return <div key={day.label} className="grid grid-cols-[2rem_1fr_3rem] items-center gap-2"><span className="text-[0.62rem] text-muted-foreground">{day.label}</span><div className="flex h-4 overflow-hidden rounded bg-muted" title={`${day.pass} pass · ${day.review} review · ${day.blocked} blocked`}><motion.div initial={{ width: 0 }} animate={{ width: `${(day.pass / max) * 100}%` }} transition={{ delay: index * 0.04 }} className="bg-success/80" /><motion.div initial={{ width: 0 }} animate={{ width: `${(day.review / max) * 100}%` }} transition={{ delay: 0.08 + index * 0.04 }} className="bg-warning" /><motion.div initial={{ width: 0 }} animate={{ width: `${(day.blocked / max) * 100}%` }} transition={{ delay: 0.12 + index * 0.04 }} className="bg-critical" /></div><span className="text-right font-mono text-[0.62rem]">{total}</span></div>})}</div><div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-center"><div><p className="font-mono text-base font-semibold text-success">1,681</p><p className="text-[0.58rem] text-muted-foreground">passed</p></div><div><p className="font-mono text-base font-semibold text-warning">70</p><p className="text-[0.58rem] text-muted-foreground">review</p></div><div><p className="font-mono text-base font-semibold text-critical">17</p><p className="text-[0.58rem] text-muted-foreground">blocked</p></div></div></CardContent></Card>
  )
}

function FireworksMetrics() {
  const max = Math.max(...fireworksLatency.map((item) => item.requests))
  return (
    <Card className="h-full bg-gradient-to-br from-provider/7 via-card to-card"><CardHeader><CardTitle className="flex items-center gap-2"><Flame className="size-4 text-provider" />Fireworks inference metrics</CardTitle><CardDescription>Mock latency distribution · last hour</CardDescription><CardAction><Badge variant="live">Operational</Badge></CardAction></CardHeader><CardContent><div className="grid grid-cols-4 gap-2 border-b pb-4 text-center"><div><p className="font-mono text-sm font-semibold"><AnimatedNumber value={fireworksMetrics.requests} /></p><p className="text-[0.56rem] text-muted-foreground">requests</p></div><div><p className="font-mono text-sm font-semibold"><AnimatedNumber value={fireworksMetrics.p50} suffix="ms" /></p><p className="text-[0.56rem] text-muted-foreground">p50</p></div><div><p className="font-mono text-sm font-semibold"><AnimatedNumber value={fireworksMetrics.p95} suffix="ms" /></p><p className="text-[0.56rem] text-muted-foreground">p95</p></div><div><p className="font-mono text-sm font-semibold text-success"><AnimatedNumber value={fireworksMetrics.uptime} decimals={2} suffix="%" /></p><p className="text-[0.56rem] text-muted-foreground">uptime</p></div></div><div className="mt-5 flex h-36 items-end gap-2">{fireworksLatency.map((item, index) => <div key={item.bucket} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><motion.div title={`${item.requests} requests`} initial={{ height: 0 }} animate={{ height: `${(item.requests / max) * 100}%` }} transition={{ duration: 0.6, delay: index * 0.06 }} className="relative rounded-t bg-provider/75 transition-colors group-hover:bg-provider"><span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[0.58rem] opacity-0 transition-opacity group-hover:opacity-100">{item.requests}</span></motion.div><span className="mt-2 truncate text-center text-[0.55rem] text-muted-foreground">{item.bucket}</span></div>)}</div><p className="mt-4 text-center text-[0.62rem] text-muted-foreground">1.84M synthetic tokens · llama-v3p3-70b-instruct</p></CardContent></Card>
  )
}

function AnalyticsDashboard() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto max-w-[1600px] space-y-section pb-8">
      <PageReveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><Badge variant="neutral">Synthetic analytics</Badge><span className="text-xs text-muted-foreground">Refreshed 2 minutes ago</span></div><h2 className="text-title">Operational intelligence</h2><p className="mt-1 text-sm text-muted-foreground">Patient flow, capacity, and trustworthy AI performance in one view.</p></div><div className="flex items-center gap-2 rounded-lg bg-card/75 px-3 py-2 text-xs ring-1 ring-border"><Activity className="size-4 text-primary" /><span className="text-muted-foreground">Reporting period</span><span className="font-medium">Jul 17–23</span></div></PageReveal>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"><MetricCard label="Hospital utilization" value={headlineAnalytics.hospitalUtilization} suffix="%" helper="staffed capacity" trend="+3.2%" icon={Gauge} delay={0.04} /><MetricCard label="Patient throughput" value={headlineAnalytics.patientThroughput} helper="patients today" trend="+7.4%" icon={UsersRound} tone="info" delay={0.08} /><MetricCard label="Average wait" value={headlineAnalytics.averageWait} suffix="m" helper="door to clinician" trend="↓ 4m" icon={Clock3} tone="warning" delay={0.12} /><MetricCard label="ICU utilization" value={headlineAnalytics.icuUtilization} suffix="%" helper="17 of 20 beds" icon={BedDouble} tone="critical" delay={0.16} /><MetricCard label="Discharge rate" value={headlineAnalytics.dischargeRate} suffix="%" helper="same-day encounters" trend="+2.1%" icon={UserCheck} tone="success" delay={0.2} /></div>

      <div className="grid gap-section xl:grid-cols-[1.45fr_0.75fr]"><PageReveal delay={0.18}><ThroughputChart /></PageReveal><PageReveal delay={0.22}><UtilizationChart /></PageReveal></div>
      <div className="grid gap-section lg:grid-cols-2"><PageReveal delay={0.24}><EmergencyTrendChart /></PageReveal><PageReveal delay={0.28}><AgentPerformance /></PageReveal></div>
      <div className="grid gap-section lg:grid-cols-2"><PageReveal delay={0.3}><BraintrustHistory /></PageReveal><PageReveal delay={0.34}><FireworksMetrics /></PageReveal></div>

      <PageReveal delay={0.38} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground"><span>All operational, patient, evaluation, and inference metrics are synthetic.</span><span>Fireworks powers the intelligence; Braintrust builds trust.</span></PageReveal>
    </div>
    </MotionConfig>
  )
}

export { AnalyticsDashboard }
