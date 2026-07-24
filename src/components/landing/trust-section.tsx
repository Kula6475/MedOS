import { ArrowRight, CheckCircle2, FileSearch, Gauge, ShieldCheck } from "lucide-react"

import { SectionReveal } from "@/components/landing/section-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    title: "Specialists analyze in parallel",
    body: "Each agent receives only the clinical context relevant to its role and returns a structured, evidence-linked result.",
    icon: Gauge,
  },
  {
    number: "02",
    title: "Every output is evaluated",
    body: "Grounding, safety, coverage, completeness, and consistency checks run before findings reach the care coordinator.",
    icon: FileSearch,
  },
  {
    number: "03",
    title: "Humans keep the final say",
    body: "Recommendations pass, require review, or are blocked. MedOS never executes autonomous clinical actions.",
    icon: CheckCircle2,
  },
]

function TrustSection() {
  return (
    <section id="workflow" className="scroll-mt-24 border-y border-border bg-muted/15 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <Badge variant="success" className="mb-5">
              <ShieldCheck data-icon="inline-start" />
              Intelligence with a safety gate
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Fast enough for emergency care. Transparent enough to trust.
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              MedOS makes the path from patient evidence to recommendation visible. Clinicians see what ran, what passed, what failed, and what still needs judgment.
            </p>
            <Button variant="link" className="mt-4 h-auto px-0" render={<a href="#trust" />}>
              See how Braintrust powers the trust layer
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </SectionReveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
          {steps.map((step, index) => (
            <SectionReveal key={step.number} delay={index * 0.07} className="bg-background p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">{step.number}</span>
                <step.icon className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-16 text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export { TrustSection }
