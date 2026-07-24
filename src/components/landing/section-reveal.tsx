"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { motionTokens } from "@/lib/design-tokens"

function SectionReveal({
  children,
  className,
  delay = 0,
}: React.PropsWithChildren<{ className?: string; delay?: number }>) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: motionTokens.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export { SectionReveal }
