import type { Metadata } from "next"
import Link from "next/link"
import { Activity, CheckCircle2, Clock3, ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react"

import { PageReveal } from "@/components/motion"
import { AppShell } from "@/components/navigation/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const metadata: Metadata = { title: "Trust Center", description: "Synthetic Braintrust evaluation and trace overview." }

const traces = [
  { id: "trace_mock_med-1042", patient: "Elena Vasquez", agents: 5, score: 97, latency: "4.27s", status: "Pass" },
  { id: "trace_mock_med-1038", patient: "Marcus Lee", agents: 5, score: 96, latency: "3.94s", status: "Pass" },
  { id: "trace_mock_med-1035", patient: "Aisha Thompson", agents: 5, score: 88, latency: "4.11s", status: "Review" },
  { id: "trace_mock_med-1029", patient: "Robert Chen", agents: 5, score: 95, latency: "3.87s", status: "Pass" },
]

export default function TrustPage() {
  return (
    <AppShell title="Trust Center" eyebrow="Braintrust Observability">
      <div className="mx-auto max-w-[1600px] space-y-section pb-8">
        <PageReveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><Badge variant="replay">Synthetic replay</Badge><span className="text-xs text-muted-foreground">Mock Braintrust data</span></div><h2 className="text-title">Every recommendation, auditable</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Evaluation health, trace availability, and safety review outcomes for simulated MedOS agent runs.</p></div><Badge variant="trust"><ShieldCheck data-icon="inline-start" />Evaluation layer healthy</Badge></PageReveal>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Evaluated runs", value: "158", helper: "last 60 minutes", icon: Activity, tone: "text-primary bg-primary/10" },
            { label: "Evaluation pass", value: "96.8%", helper: "all active scorers", icon: CheckCircle2, tone: "text-success bg-success/10" },
            { label: "Flagged for review", value: "5", helper: "requires human review", icon: TriangleAlert, tone: "text-warning bg-warning/10" },
            { label: "p95 evaluation", value: "1,280ms", helper: "mock end-to-end", icon: Clock3, tone: "text-trust bg-trust/10" },
          ].map((metric) => (
            <Card key={metric.label} className="py-0">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-4 font-mono text-2xl font-semibold tracking-[-0.04em]">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p></div>
                <span className={`grid size-8 place-items-center rounded-lg ${metric.tone}`}><metric.icon className="size-4" /></span>
              </CardContent>
            </Card>
          ))}
        </div>
        <PageReveal delay={0.16}><Card><CardHeader><CardTitle>Recent analysis traces</CardTitle><CardDescription>Mock trace history for synthetic patients; no external observability API is connected.</CardDescription></CardHeader><CardContent className="px-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Trace</TableHead><TableHead>Patient</TableHead><TableHead>Agents</TableHead><TableHead>Evaluation</TableHead><TableHead>Latency</TableHead><TableHead className="text-right">Workspace</TableHead></TableRow></TableHeader><TableBody>{traces.map((trace) => <TableRow key={trace.id}><TableCell className="font-mono text-xs text-muted-foreground">{trace.id}</TableCell><TableCell className="font-medium">{trace.patient}</TableCell><TableCell>{trace.agents}</TableCell><TableCell><Badge variant={trace.status === "Pass" ? "success" : "warning"}>{trace.status} · {trace.score}</Badge></TableCell><TableCell className="font-mono">{trace.latency}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" render={<Link href={`/patients/${trace.id.replace("trace_mock_", "").toUpperCase()}`} />}>Open <ExternalLink /></Button></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card></PageReveal>
        <PageReveal delay={0.2} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground"><span>Mock evaluations and traces only; no Braintrust API requests are made.</span><span>Fireworks powers the intelligence; Braintrust builds trust.</span></PageReveal>
      </div>
    </AppShell>
  )
}
