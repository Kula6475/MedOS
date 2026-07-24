"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  FlaskConical,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { StatusPulse } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motionTokens } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

const patients = [
  { acuity: "1", name: "Rosa M.", reason: "Respiratory distress", wait: "02m" },
  { acuity: "2", name: "Marcus T.", reason: "Chest discomfort", wait: "07m" },
  { acuity: "2", name: "Lina P.", reason: "Acute asthma", wait: "11m" },
]

const agents = [
  { label: "Triage", icon: Activity, latency: "0.8s" },
  { label: "Medication safety", icon: ShieldCheck, latency: "1.1s" },
  { label: "Labs", icon: FlaskConical, latency: "0.9s" },
  { label: "Imaging", icon: HeartPulse, latency: "1.2s" },
]

function ProductPreview() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      id="product-preview"
      initial={reduceMotion ? false : { opacity: 0, y: 24, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.75, delay: 0.2, ease: motionTokens.easeOut }}
      className="relative scroll-mt-28 lg:pl-4"
      style={{ perspective: 1200 }}
    >
      <div className="absolute -inset-14 -z-10 rounded-full bg-primary/14 blur-3xl" />
      <Card variant="elevated" className="overflow-hidden rounded-2xl border-border bg-card/90 py-0 shadow-[0_34px_100px_-36px_oklch(0.05_0.05_252/0.92)] ring-border">
        <div className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <HeartPulse className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold">ED Command Center</p>
              <p className="text-[0.625rem] text-muted-foreground">Synthetic environment</p>
            </div>
          </div>
          <Badge variant="trust">
            <ShieldCheck data-icon="inline-start" />
            Braintrust monitored
          </Badge>
        </div>

        <div className="grid min-h-[390px] sm:grid-cols-[1.04fr_0.96fr]">
          <div className="border-b border-border p-4 sm:border-r sm:border-b-0 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Patient queue</p>
                <p className="mt-1 text-sm font-semibold">24 active encounters</p>
              </div>
              <div className="flex items-center gap-1.5 text-[0.65rem] text-success">
                <StatusPulse />
                Live
              </div>
            </div>

            <div className="space-y-2">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.name}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.55 + index * 0.08 }}
                  className={cn(
                    "grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl border px-3 py-3",
                    index === 0
                      ? "border-critical/30 bg-critical/7"
                      : "border-border bg-muted/20"
                  )}
                >
                  <div className={cn("flex size-7 items-center justify-center rounded-lg font-mono text-xs font-bold", index === 0 ? "bg-critical text-critical-foreground" : "bg-warning/12 text-warning")}>
                    {patient.acuity}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{patient.name}</p>
                    <p className="truncate text-[0.65rem] text-muted-foreground">{patient.reason}</p>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground">
                    <Clock3 className="size-3" aria-hidden="true" />
                    {patient.wait}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["ED census", "24"],
                ["Critical", "04"],
                ["ICU beds", "03"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                  <p className="font-mono text-base font-semibold tabular-nums">{value}</p>
                  <p className="mt-0.5 text-[0.58rem] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-muted/15 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">AI care team</p>
                <p className="mt-1 text-sm font-semibold">Analyzing Rosa M.</p>
              </div>
              <BrainCircuit className="size-5 text-trust" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.label}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.72 + index * 0.08 }}
                  className="rounded-xl border border-success/16 bg-success/[0.055] p-3"
                >
                  <div className="flex items-center justify-between">
                    <agent.icon className="size-3.5 text-success" aria-hidden="true" />
                    <Check className="size-3.5 text-success" aria-hidden="true" />
                  </div>
                  <p className="mt-3 truncate text-[0.68rem] font-semibold">{agent.label}</p>
                  <p className="mt-0.5 font-mono text-[0.58rem] text-muted-foreground">Passed · {agent.latency}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: 1.15 }}
              className="mt-3 flex-1 rounded-xl border border-trust/25 bg-trust/[0.065] p-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sparkles className="size-3.5 text-trust" aria-hidden="true" />
                  Coordinated plan
                </div>
                <Badge variant="success">92% confidence</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {["Immediate clinician assessment", "Medication allergy review", "Escalate bed and care coordination"].map((item, index) => (
                  <div key={item} className="flex items-start gap-2 text-[0.65rem] leading-4 text-muted-foreground">
                    <span className="mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-trust/15 font-mono text-[0.5rem] text-trust">{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Card>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 -bottom-5 hidden rounded-xl border border-trust/22 bg-popover/92 p-3 shadow-float backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-trust" aria-hidden="true" />
          <div>
            <p className="text-[0.65rem] font-semibold">Every output evaluated</p>
            <p className="font-mono text-[0.55rem] text-muted-foreground">Trace available · 8 spans</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HeroSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-24 sm:px-6 sm:pt-40 lg:px-8 lg:pt-44 lg:pb-32">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_16%,oklch(0.72_0.145_184/0.16),transparent_28%),radial-gradient(circle_at_88%_24%,oklch(0.72_0.15_285/0.14),transparent_30%)]" />
      <div className="surface-grid absolute inset-0 -z-10 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-36 left-[8%] -z-10 size-64 rounded-full bg-primary/7 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.84fr_1.16fr] lg:gap-10 xl:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: motionTokens.easeOut }}
          className="relative z-10"
        >
          <Badge variant="trust" className="mb-6 h-7 px-3">
            <ShieldCheck data-icon="inline-start" />
            Clinical intelligence, continuously evaluated
          </Badge>
          <h1 className="max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-[4.3rem]">
            Emergency care,
            <span className="mt-1 block bg-linear-to-r from-primary via-[#8be4db] to-trust bg-clip-text text-transparent">
              orchestrated.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            MedOS turns fragmented patient signals into a clear, prioritized clinical picture—so emergency teams can move faster without sacrificing oversight.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<a href="/dashboard" />}>
              See MedOS in action
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#trust" />}>
              Explore the trust layer
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
            {["Synthetic patient data", "Human review required", "No autonomous actions"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="size-3.5 text-primary" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <ProductPreview />
      </div>
    </section>
  )
}

export { HeroSection }
