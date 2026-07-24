"use client"

import {
  Beaker,
  BrainCircuit,
  Database,
  ImageIcon,
  Pill,
  ShieldCheck,
  Stethoscope,
  Target,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { AgentProfile } from "@/lib/mock-agent-profiles"

const agentIcons = { triage: Stethoscope, medication: Pill, labs: Beaker, imaging: ImageIcon, coordination: BrainCircuit }

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-label text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-5 text-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AgentDetailSheet({ agent, open, onOpenChange }: { agent: AgentProfile | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!agent) return null
  const Icon = agentIcons[agent.id]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20"><Icon className="size-5" /></span>
            <div className="min-w-0">
              <SheetTitle>{agent.name}</SheetTitle>
              <SheetDescription className="mt-0.5">{agent.state} · {agent.analysesCompleted} analyses</SheetDescription>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{agent.purpose}</p>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/30 p-3 text-center ring-1 ring-border">
              <p className="font-mono text-lg font-semibold text-trust">{agent.avgEvaluationScore}</p>
              <p className="mt-0.5 text-[0.6rem] text-muted-foreground">avg eval score</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center ring-1 ring-border">
              <p className="font-mono text-lg font-semibold">{agent.avgLatencyMs}<span className="text-xs font-normal">ms</span></p>
              <p className="mt-0.5 text-[0.6rem] text-muted-foreground">avg latency</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center ring-1 ring-border">
              <p className="font-mono text-lg font-semibold text-success">{agent.analysesCompleted}</p>
              <p className="mt-0.5 text-[0.6rem] text-muted-foreground">analyses run</p>
            </div>
          </div>

          <DetailList title="Responsibilities" items={agent.responsibilities} />
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailList title="Inputs" items={agent.inputs} />
            <DetailList title="Outputs" items={agent.outputs} />
          </div>
          <Separator />
          <DetailList title="Constraints" items={agent.constraints} />

          <Separator />
          <div>
            <p className="text-label flex items-center gap-1.5 text-trust"><ShieldCheck className="size-3" />Safety checks</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{agent.safetyChecks.map((check) => <Badge key={check} variant="trust">{check}</Badge>)}</div>
          </div>

          <div>
            <p className="text-label flex items-center gap-1.5 text-muted-foreground"><Database className="size-3" />Connected data sources</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{agent.dataSources.map((source) => <Badge key={source} variant="neutral">{source}</Badge>)}</div>
          </div>

          <Separator />
          <div>
            <p className="text-label text-muted-foreground">Recent activity</p>
            <ul className="mt-2 space-y-2.5">
              {agent.recentActivity.map((activity) => (
                <li key={activity.detail} className="flex items-start justify-between gap-3 text-xs leading-5">
                  <span className="text-foreground">{activity.detail}</span>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-provider/7 p-3 text-[0.68rem] text-muted-foreground ring-1 ring-provider/18">
            <Zap className="size-3.5 shrink-0 text-provider" />
            Fireworks inference · simulated metrics for this demo
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-trust/7 p-3 text-[0.68rem] text-muted-foreground ring-1 ring-trust/18">
            <Target className="size-3.5 shrink-0 text-trust" />
            All performance figures are deterministic mock data, not live evaluations
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AgentDetailSheet }
