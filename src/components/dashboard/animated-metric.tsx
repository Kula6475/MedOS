"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AnimatedNumberProps = {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
}

function AnimatedNumber({ value, decimals = 0, suffix = "", prefix = "" }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion()
  const raw = useMotionValue(reduceMotion ? value : 0)
  const spring = useSpring(raw, { stiffness: 80, damping: 18, mass: 0.7 })
  const displayed = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`,
  )

  useEffect(() => {
    raw.set(value)
  }, [raw, value])

  const accessibleValue = `${prefix}${value.toFixed(decimals)}${suffix}`

  return (
    <>
      <motion.span aria-hidden="true">{displayed}</motion.span>
      <span className="sr-only">{accessibleValue}</span>
    </>
  )
}

type MetricCardProps = {
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  helper: string
  trend?: string
  icon: LucideIcon
  tone?: "primary" | "critical" | "warning" | "info" | "trust" | "success"
  delay?: number
}

const toneClasses = {
  primary: "bg-primary/12 text-primary ring-primary/20",
  critical: "bg-critical/12 text-critical ring-critical/20",
  warning: "bg-warning/12 text-warning ring-warning/20",
  info: "bg-info/12 text-info ring-info/20",
  trust: "bg-trust/12 text-trust ring-trust/20",
  success: "bg-success/12 text-success ring-success/20",
}

function MetricCard({ label, value, suffix, prefix, decimals, helper, trend, icon: Icon, tone = "primary", delay = 0 }: MetricCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="h-full bg-card/88 py-0 backdrop-blur-xl">
        <CardContent className="flex h-full flex-col justify-between gap-5 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <span className={cn("grid size-8 place-items-center rounded-lg ring-1", toneClasses[tone])}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div>
            <div className="font-mono text-2xl font-semibold leading-none tracking-[-0.045em] tabular-nums sm:text-[1.75rem]">
              <AnimatedNumber value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[0.7rem]">
              <span className="text-muted-foreground">{helper}</span>
              {trend && <span className="font-medium text-success">{trend}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export { AnimatedNumber, MetricCard }
