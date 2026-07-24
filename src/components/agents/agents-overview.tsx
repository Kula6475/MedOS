"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Beaker,
  BrainCircuit,
  ChevronRight,
  Flame,
  ImageIcon,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

import { AgentDetailSheet } from "@/components/agents/agent-detail-sheet"
import { PageReveal, StatusPulse } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { agentProfiles, type AgentId, type AgentState } from "@/lib/mock-agent-profiles"
import { cn } from "@/lib/utils"

const agentIcons = { triage: Stethoscope, medication: Pill, labs: Beaker, imaging: ImageIcon, coordination: BrainCircuit }

const stateTone: Record<AgentState, "success" | "warning" | "info" | "trust"> = {
  Monitoring: "success",
  Reviewing: "warning",
  Idle: "info",
  Synthesizing: "trust",
}

function AgentsOverview() {
  const reduceMotion = useReducedMotion()
  const [selectedId, setSelectedId] = useState<AgentId | null>(null)
  const selected = agentProfiles.find((agent) => agent.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-[1600px] space-y-section pb-8">
      <PageReveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2"><Badge variant="replay">Synthetic replay</Badge><span className="text-xs text-muted-foreground">Five coordinated specialists</span></div>
          <h2 className="text-title">Specialized AI agents</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Every agent runs on Fireworks AI inference and is traced and evaluated through Braintrust. Open any card for responsibilities, contracts, and simulated performance.</p>
        </div>
        <Badge variant="trust"><ShieldCheck data-icon="inline-start" />Braintrust monitored</Badge>
      </PageReveal>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agentProfiles.map((agent, index) => {
          const Icon = agentIcons[agent.id]
          return (
            <PageReveal key={agent.id} delay={index * 0.05}>
              <Card variant="interactive" className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20"><Icon className="size-5" /></span>
                    <CardAction>
                      <Badge variant={stateTone[agent.state]}><StatusPulse tone={stateTone[agent.state]} className="mr-1" />{agent.state}</Badge>
                    </CardAction>
                  </div>
                  <CardTitle className="mt-3">{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{agent.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/25 p-3 text-center">
                    <div>
                      <p className="font-mono text-sm font-semibold">{agent.analysesCompleted}</p>
                      <p className="text-[0.58rem] text-muted-foreground">analyses</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-trust">{agent.avgEvaluationScore}%</p>
                      <p className="text-[0.58rem] text-muted-foreground">avg eval</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold">{agent.avgLatencyMs}ms</p>
                      <p className="text-[0.58rem] text-muted-foreground">avg latency</p>
                    </div>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-trust"
                      initial={reduceMotion ? { width: `${agent.avgEvaluationScore}%` } : { width: 0 }}
                      animate={{ width: `${agent.avgEvaluationScore}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.2 + index * 0.06 }}
                    />
                  </div>

                  <div>
                    <p className="text-[0.6rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">Recent activity</p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">{agent.recentActivity[0]?.detail}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {agent.dataSources.slice(0, 3).map((source) => <Badge key={source} variant="neutral" className="text-[0.62rem]">{source}</Badge>)}
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedId(agent.id)}>
                    View details<ChevronRight />
                  </Button>
                </CardContent>
              </Card>
            </PageReveal>
          )
        })}

        <PageReveal delay={agentProfiles.length * 0.05}>
          <Card variant="trust" className={cn("h-full bg-gradient-to-br from-provider/10 via-card to-card")}>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-provider/15 text-provider ring-1 ring-provider/20"><Flame className="size-5" /></div>
              <CardTitle className="mt-3">Fireworks powers the intelligence</CardTitle>
              <CardDescription>Braintrust builds trust.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-5 text-muted-foreground">
              <p>Every agent above routes inference through Fireworks AI and is traced end-to-end through Braintrust, with confidence derived from evaluation scores rather than model self-reporting.</p>
              <p>The Care Coordination Agent always requires human clinician review before a plan is considered actionable.</p>
            </CardContent>
          </Card>
        </PageReveal>
      </div>

      <PageReveal delay={0.4} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>Agent metrics shown are simulated for demonstration and are not live evaluation results.</span>
        <span>MedOS is clinical decision support—not medical advice or autonomous care.</span>
      </PageReveal>

      <AgentDetailSheet agent={selected} open={selectedId !== null} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  )
}

export { AgentsOverview }
