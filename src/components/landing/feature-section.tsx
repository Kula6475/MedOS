import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  FlaskConical,
  Pill,
  ScanLine,
  Sparkles,
} from "lucide-react"

import { SectionReveal } from "@/components/landing/section-reveal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const agents = [
  {
    name: "Triage Agent",
    description: "Continuously prioritizes risk from symptoms, arrival context, and vital-sign instability.",
    icon: Activity,
    tone: "text-primary bg-primary/10 ring-primary/18",
    detail: "Acuity & instability",
  },
  {
    name: "Medication Safety",
    description: "Surfaces documented allergy conflicts, contraindications, and medication risks for review.",
    icon: Pill,
    tone: "text-warning bg-warning/10 ring-warning/18",
    detail: "Allergy & interaction risk",
  },
  {
    name: "Lab Analysis",
    description: "Synthesizes abnormalities and trends while identifying missing information for consideration.",
    icon: FlaskConical,
    tone: "text-info bg-info/10 ring-info/18",
    detail: "Critical values & trends",
  },
  {
    name: "Imaging Review",
    description: "Extracts high-signal findings and limitations from written radiology reports.",
    icon: ScanLine,
    tone: "text-trust bg-trust/10 ring-trust/18",
    detail: "Report-grounded findings",
  },
]

function FeatureSection() {
  return (
    <section id="platform" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="max-w-2xl">
          <Badge variant="info" className="mb-5">
            <BrainCircuit data-icon="inline-start" />
            One coordinated system
          </Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
            Five specialists. One clear clinical picture.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            MedOS gives every patient record a focused AI care team, then reconciles their findings into a plan clinicians can inspect and challenge.
          </p>
        </SectionReveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {agents.map((agent, index) => (
            <SectionReveal key={agent.name} delay={index * 0.06}>
              <Card variant="interactive" className="h-full min-h-72 py-0">
                <CardHeader className="p-5 pb-0">
                  <div className={`flex size-10 items-center justify-center rounded-xl ring-1 ${agent.tone}`}>
                    <agent.icon className="size-5" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-5 pt-8">
                  <p className="text-lg font-semibold tracking-[-0.02em]">{agent.name}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{agent.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
                    {agent.detail}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal className="mt-4">
          <Card variant="trust" className="relative overflow-hidden py-0">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,oklch(0.72_0.15_285/0.15),transparent_62%)] lg:block" />
            <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10">
              <div className="max-w-2xl">
                <div className="flex size-11 items-center justify-center rounded-xl bg-trust/12 text-trust ring-1 ring-trust/20">
                  <Sparkles className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Care Coordination Agent</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Reconciles every validated specialist output into urgent, next, and monitor priorities—with evidence, responsible roles, limitations, and mandatory human review.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["Urgent", "Immediate risk and escalation"],
                  ["Next", "Time-bound care coordination"],
                  ["Monitor", "Watch points and unresolved risk"],
                ].map(([title, text], index) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl border border-border bg-background/35 p-3.5 backdrop-blur">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-trust/12 font-mono text-[0.65rem] font-semibold text-trust">0{index + 1}</div>
                    <div>
                      <p className="text-xs font-semibold">{title}</p>
                      <p className="mt-0.5 text-[0.68rem] leading-4 text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </SectionReveal>
      </div>
    </section>
  )
}

export { FeatureSection }
