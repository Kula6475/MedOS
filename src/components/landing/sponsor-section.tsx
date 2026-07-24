import { Activity, ArrowRight, BrainCircuit, Check, Flame, ShieldCheck, Timer } from "lucide-react"

import { SectionReveal } from "@/components/landing/section-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function SponsorSection() {
  return (
    <>
      <section id="trust" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <Badge variant="trust" className="mb-5">
              <BrainCircuit data-icon="inline-start" />
              The infrastructure behind MedOS
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Intelligence is only useful when teams can trust it.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              MedOS pairs high-performance inference with continuous evaluation, giving every clinical-support output an observable path from input to decision.
            </p>
          </SectionReveal>

          <div id="partners" className="mt-14 grid scroll-mt-24 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <SectionReveal>
              <Card variant="trust" className="h-full overflow-hidden py-0">
                <div className="relative min-h-[410px] p-6 sm:p-9">
                  <div className="absolute -top-32 -right-20 size-80 rounded-full bg-trust/18 blur-3xl" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-trust text-trust-foreground shadow-sm">
                          <BrainCircuit className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold tracking-[-0.02em]">Braintrust</p>
                          <p className="text-xs text-muted-foreground">Primary trust & observability layer</p>
                        </div>
                      </div>
                      <Badge variant="trust">Core integration</Badge>
                    </div>

                    <div className="mt-16 max-w-xl">
                      <p className="text-2xl leading-tight font-semibold tracking-[-0.035em] sm:text-3xl">
                        Every recommendation is traced, scored, and auditable before it reaches the care team.
                      </p>
                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {[
                          "Nested agent traces",
                          "Evidence-grounding scores",
                          "Latency and model metrics",
                          "Pass, review, or blocked status",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="size-4 text-trust" aria-hidden="true" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-12">
                      <div>
                        <p className="font-mono text-3xl font-semibold tracking-[-0.045em] text-trust">100%</p>
                        <p className="mt-1 text-xs text-muted-foreground">Target trace coverage</p>
                      </div>
                      <ShieldCheck className="size-20 text-trust/12" strokeWidth={1.1} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Card>
            </SectionReveal>

            <SectionReveal delay={0.08}>
              <Card className="h-full overflow-hidden border-provider/18 bg-provider/[0.045] py-0 ring-provider/18">
                <div className="flex min-h-[410px] flex-col p-6 sm:p-9">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-provider text-provider-foreground shadow-sm">
                    <Flame className="size-5" aria-hidden="true" />
                  </div>
                  <div className="mt-6">
                    <p className="text-lg font-semibold tracking-[-0.02em]">Fireworks AI</p>
                    <p className="mt-1 text-xs text-muted-foreground">High-performance inference</p>
                  </div>
                  <p className="mt-10 text-xl leading-snug font-semibold tracking-[-0.025em]">
                    Fast, structured intelligence for every MedOS specialist agent.
                  </p>
                  <div className="mt-auto space-y-3 pt-12">
                    <div className="flex items-center gap-3 rounded-xl border border-provider/15 bg-background/30 p-3.5">
                      <Timer className="size-4 text-provider" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold">Low-latency serving</p>
                        <p className="text-[0.68rem] text-muted-foreground">Built for time-sensitive workflows</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-provider/15 bg-background/30 p-3.5">
                      <Activity className="size-4 text-provider" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold">Structured outputs</p>
                        <p className="text-[0.68rem] text-muted-foreground">Reliable agent contracts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </SectionReveal>
          </div>

          <SectionReveal className="mt-5 rounded-2xl border border-border bg-linear-to-r from-primary/8 via-trust/8 to-provider/8 px-5 py-4 text-center">
            <p className="text-sm font-semibold tracking-[-0.01em] sm:text-base">
              <span className="text-provider">Fireworks powers the intelligence;</span>{" "}
              <span className="text-trust">Braintrust builds trust.</span>
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <SectionReveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-primary/18 bg-[radial-gradient(circle_at_18%_20%,oklch(0.72_0.145_184/0.2),transparent_36%),radial-gradient(circle_at_88%_78%,oklch(0.72_0.15_285/0.16),transparent_38%),oklch(0.205_0.042_252)] px-6 py-16 text-center shadow-float sm:px-10 sm:py-20">
            <div className="surface-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />
            <div className="relative mx-auto max-w-3xl">
              <Badge variant="info" className="mb-6">Built for the moments that matter</Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
                Give every emergency team a clearer next move.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                See how MedOS brings prioritization, safety, coordination, and trustworthy AI into one clinical command center.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" render={<a href="/dashboard" />}>
                  Explore the MedOS experience
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" render={<a href="#platform" />}>
                  Meet the AI care team
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Synthetic data only · Clinical decision support · Human review required
              </p>
            </div>
          </div>
        </SectionReveal>
      </section>
    </>
  )
}

export { SponsorSection }
