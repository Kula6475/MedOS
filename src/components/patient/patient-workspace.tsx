"use client"

import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Beaker,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  ImageIcon,
  MapPin,
  Pill,
  ShieldAlert,
  Siren,
  Stethoscope,
  UserRound,
} from "lucide-react"
import Link from "next/link"

import { PageReveal } from "@/components/motion"
import { AgentWorkflow } from "@/components/patient/agent-workflow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ClinicalStatus, PatientDetail } from "@/lib/mock-patient-details"
import { cn } from "@/lib/utils"

const statusText: Record<ClinicalStatus, string> = {
  critical: "text-critical", high: "text-warning", abnormal: "text-warning", normal: "text-success", pending: "text-info",
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <PageReveal className={className} delay={delay}>{children}</PageReveal>
}

function PatientWorkspace({ detail }: { detail: PatientDetail }) {
  const { patient } = detail

  return (
    <div className="mx-auto max-w-[1600px] space-y-section pb-8">
      <Reveal>
        <Button variant="ghost" size="sm" render={<Link href="/dashboard" />} className="mb-3 -ml-2 text-muted-foreground"><ArrowLeft />Back to patient queue</Button>
        <Card variant={patient.acuity === "ESI 1" ? "critical" : "default"} className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="grid gap-0 xl:grid-cols-[1fr_auto]">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20"><UserRound className="size-5" /></span>
                    <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-[-0.035em]">{patient.name}</h2><Badge variant={patient.acuity === "ESI 1" ? "critical" : "warning"}>{patient.acuity}</Badge><Badge variant="neutral">Synthetic patient</Badge></div><p className="mt-1.5 text-sm text-muted-foreground">{patient.age}-year-old {patient.sex === "F" ? "female" : "male"} · {patient.id}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2"><Badge variant="critical"><Siren data-icon="inline-start" />{patient.status}</Badge><Badge variant="outline"><MapPin data-icon="inline-start" />{patient.location}</Badge></div>
                </div>
                <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3">
                  <div><p className="text-label text-muted-foreground">Chief complaint</p><p className="mt-1 text-sm font-medium">{patient.chiefComplaint}</p></div>
                  <div><p className="text-label text-muted-foreground">Emergency severity</p><p className={cn("mt-1 text-sm font-medium", patient.acuity === "ESI 1" ? "text-critical" : "text-warning")}>{patient.acuity === "ESI 1" ? "Immediate life-saving intervention" : "High-risk, time-sensitive evaluation"}</p></div>
                  <div><p className="text-label text-muted-foreground">Arrival status</p><p className="mt-1 text-sm font-medium">{patient.waitMinutes === 0 ? "Immediate rooming" : `${patient.waitMinutes} minute wait`} · Day shift</p></div>
                </div>
              </div>
              <div className="border-t bg-critical/5 p-5 xl:w-80 xl:border-t-0 xl:border-l">
                <p className="flex items-center gap-2 text-xs font-semibold text-critical"><AlertOctagon className="size-4" />Active safety alerts</p>
                <div className="mt-3 space-y-2">{patient.alerts.length ? patient.alerts.map((alert) => <div key={alert} className="rounded-lg bg-background/60 px-3 py-2 text-xs font-medium ring-1 ring-critical/18">{alert}</div>) : <p className="text-xs text-muted-foreground">No active safety alerts documented.</p>}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <AgentWorkflow detail={detail} />

      <div className="grid gap-section xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.65fr)]">
        <div className="min-w-0 space-y-section">
          <div className="grid gap-section lg:grid-cols-2">
            <Reveal delay={0.04}><Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-4 text-primary" />Demographics</CardTitle><CardDescription>Verified encounter information</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-x-5 gap-y-4">{detail.demographics.map((item) => <div key={item.label}><p className="text-[0.68rem] text-muted-foreground">{item.label}</p><p className="mt-1 text-xs font-medium">{item.value}</p></div>)}</CardContent></Card></Reveal>
            <Reveal delay={0.08}><Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="size-4 text-primary" />Symptoms & history</CardTitle><CardDescription>Patient-reported and collateral history</CardDescription></CardHeader><CardContent className="space-y-3">{detail.symptoms.map((symptom) => <div key={symptom.name} className="flex justify-between gap-4 border-b pb-2.5 last:border-0 last:pb-0"><div><p className="text-xs font-medium">{symptom.name}</p><p className="mt-0.5 text-[0.68rem] text-muted-foreground">{symptom.detail}</p></div><span className="shrink-0 text-[0.65rem] text-muted-foreground">{symptom.onset}</span></div>)}<div className="flex flex-wrap gap-1.5 pt-1">{detail.history.map((item) => <Badge key={item} variant="neutral">{item}</Badge>)}</div></CardContent></Card></Reveal>
          </div>

          <Reveal delay={0.12}><Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="size-4 text-primary" />Vital signs</CardTitle><CardDescription>Most recent bedside measurements</CardDescription><CardAction><Badge variant="live">Continuous monitoring</Badge></CardAction></CardHeader><CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{detail.vitals.map((vital) => <div key={vital.name} className="rounded-lg bg-muted/35 p-3 ring-1 ring-border"><p className="truncate text-[0.65rem] text-muted-foreground">{vital.name}</p><p className={cn("mt-2 font-mono text-lg font-semibold tracking-[-0.04em]", statusText[vital.status])}>{vital.value}<span className="ml-1 text-[0.58rem] font-normal text-muted-foreground">{vital.unit}</span></p><p className="mt-1 text-[0.62rem] text-muted-foreground">{vital.trend}</p></div>)}</CardContent></Card></Reveal>

          <div className="grid gap-section lg:grid-cols-2">
            <Reveal delay={0.16}><Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Pill className="size-4 text-info" />Medications</CardTitle><CardDescription>Home and encounter medications</CardDescription></CardHeader><CardContent className="space-y-2">{detail.medications.map((med) => <div key={med.name} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5"><div><p className="text-xs font-medium">{med.name} <span className="text-muted-foreground">{med.dose}</span></p><p className="mt-0.5 text-[0.65rem] text-muted-foreground">{med.route} · {med.schedule}</p></div><Badge variant={med.status === "Held" ? "warning" : med.status === "Infusing" ? "live" : "neutral"}>{med.status}</Badge></div>)}</CardContent></Card></Reveal>
            <Reveal delay={0.2}><Card className="h-full ring-critical/25"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="size-4 text-critical" />Allergies</CardTitle><CardDescription>Documented reactions and severity</CardDescription></CardHeader><CardContent className="space-y-2">{detail.allergies.map((allergy) => <div key={allergy.substance} className="rounded-lg bg-critical/6 p-3 ring-1 ring-critical/15"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">{allergy.substance}</p><Badge variant={allergy.severity === "Severe" ? "critical" : "warning"}>{allergy.severity}</Badge></div><p className="mt-1 text-[0.68rem] text-muted-foreground">{allergy.reaction}</p></div>)}</CardContent></Card></Reveal>
          </div>

          <Reveal delay={0.24}><Card><CardHeader><CardTitle className="flex items-center gap-2"><Beaker className="size-4 text-trust" />Laboratory results</CardTitle><CardDescription>Values from the current emergency encounter</CardDescription></CardHeader><CardContent className="px-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Test</TableHead><TableHead>Result</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Collected</TableHead></TableRow></TableHeader><TableBody>{detail.labs.map((lab) => <TableRow key={lab.test}><TableCell className="font-medium">{lab.test}</TableCell><TableCell className={cn("font-mono font-semibold", statusText[lab.status])}>{lab.value}</TableCell><TableCell className="text-muted-foreground">{lab.range}</TableCell><TableCell><Badge variant={lab.status === "critical" ? "critical" : lab.status === "normal" ? "success" : lab.status === "pending" ? "info" : "warning"}>{lab.status}</Badge></TableCell><TableCell className="text-right font-mono text-muted-foreground">{lab.collected}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card></Reveal>

          <Reveal delay={0.28}><Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="size-4 text-info" />Imaging report</CardTitle><CardDescription>Final and preliminary diagnostic interpretations</CardDescription></CardHeader><CardContent className="space-y-4">{detail.imaging.map((report) => <div key={report.study}><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{report.study}</p><Badge variant="neutral"><Clock3 data-icon="inline-start" />{report.time}</Badge></div><div className="mt-3 rounded-lg bg-info/6 p-3 ring-1 ring-info/15"><p className="text-label text-info">Impression</p><p className="mt-1.5 text-xs leading-5">{report.impression}</p></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{report.findings}</p></div>)}</CardContent></Card></Reveal>

          <Reveal delay={0.32}><Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-4 text-primary" />Physician & nursing notes</CardTitle><CardDescription>Signed encounter documentation</CardDescription></CardHeader><CardContent className="space-y-4">{detail.notes.map((note) => <article key={`${note.author}-${note.time}`} className="border-l-2 border-primary/30 pl-4"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-xs font-semibold">{note.author}</p><span className="text-[0.65rem] text-muted-foreground">{note.role} · {note.time}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{note.text}</p></article>)}</CardContent></Card></Reveal>
        </div>

        <aside className="space-y-section">
          <Reveal delay={0.1} className="xl:sticky xl:top-20"><Card className="bg-gradient-to-br from-primary/8 via-card to-card"><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="size-4 text-primary" />Care recommendations</CardTitle><CardDescription>Static protocol-based considerations—not AI generated</CardDescription><CardAction><Badge variant="warning">Clinician review</Badge></CardAction></CardHeader><CardContent className="space-y-3">{detail.recommendations.map((recommendation, index) => <div key={recommendation.action} className="rounded-lg bg-background/45 p-3 ring-1 ring-border"><div className="flex items-center justify-between gap-2"><Badge variant={recommendation.priority === "Immediate" ? "critical" : recommendation.priority === "High" ? "warning" : "info"}>{recommendation.priority}</Badge><span className="text-[0.63rem] text-muted-foreground">{recommendation.owner}</span></div><p className="mt-2 text-xs font-medium leading-5">{index + 1}. {recommendation.action}</p><p className="mt-1 text-[0.67rem] leading-4 text-muted-foreground">{recommendation.rationale}</p></div>)}<div className="flex gap-2 rounded-lg bg-warning/7 p-3 text-[0.66rem] leading-4 text-muted-foreground ring-1 ring-warning/15"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />These considerations require independent clinician review and do not constitute medical advice or autonomous orders.</div></CardContent></Card>

          <Card className="mt-section"><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-4 text-trust" />Clinical timeline</CardTitle><CardDescription>Current encounter sequence</CardDescription></CardHeader><CardContent><ol className="relative space-y-5 border-l border-border pl-5">{detail.timeline.map((event) => <li key={`${event.time}-${event.title}`} className="relative"><span className={cn("absolute top-1 -left-[1.43rem] size-2 rounded-full ring-4 ring-card", event.tone === "critical" ? "bg-critical" : event.tone === "normal" ? "bg-success" : event.tone === "pending" ? "bg-info" : "bg-warning")} /><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium">{event.title}</p><span className="font-mono text-[0.63rem] text-muted-foreground">{event.time}</span></div><p className="mt-1 text-[0.67rem] leading-4 text-muted-foreground">{event.detail}</p></li>)}</ol></CardContent></Card></Reveal>
        </aside>
      </div>

      <Reveal delay={0.38} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[0.68rem] text-muted-foreground"><span>All patient information displayed is realistic synthetic data.</span><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" />Agent analysis is simulated locally; no real AI APIs are called.</span></Reveal>
    </div>
  )
}

export { PatientWorkspace }
