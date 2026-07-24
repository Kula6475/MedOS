"use client"

import * as React from "react"
import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion"

import { motionTokens } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

function FadeIn({ className, children, ...props }: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : motionTokens.standard,
        ease: motionTokens.easeOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type PageRevealProps = HTMLMotionProps<"div"> & {
  delay?: number
}

function PageReveal({ className, children, delay = 0, ...props }: PageRevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.42,
        delay: reduceMotion ? 0 : delay,
        ease: motionTokens.easeOut,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function Stagger({ className, children, ...props }: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduceMotion ? 0 : 0.035 },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({ className, children, ...props }: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduceMotion ? 0 : motionTokens.standard,
            ease: motionTokens.easeOut,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function StatusPulse({
  className,
  tone = "success",
}: {
  className?: string
  tone?: "success" | "warning" | "critical" | "info" | "trust"
}) {
  const reduceMotion = useReducedMotion()
  const toneClass = {
    success: "bg-success",
    warning: "bg-warning",
    critical: "bg-critical",
    info: "bg-info",
    trust: "bg-trust",
  }[tone]

  return (
    <span className={cn("relative flex size-2", className)} aria-hidden="true">
      {!reduceMotion && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-50",
            toneClass
          )}
        />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", toneClass)} />
    </span>
  )
}

export { FadeIn, PageReveal, Stagger, StaggerItem, StatusPulse }
