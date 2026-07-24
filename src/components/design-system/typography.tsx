import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const headingVariants = cva("font-heading text-foreground text-balance", {
  variants: {
    size: {
      display: "text-display",
      title: "text-title",
      section: "text-section",
      card: "text-base font-semibold tracking-[-0.012em]",
    },
  },
  defaultVariants: {
    size: "section",
  },
})

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const

function Heading({
  className,
  level = 2,
  size = "section",
  ...props
}: HeadingProps) {
  const Tag = headingTags[level]

  return (
    <Tag className={cn(headingVariants({ size }), className)} {...props} />
  )
}

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      body: "text-sm leading-6",
      lead: "text-base leading-7 text-muted-foreground",
      muted: "text-sm leading-5 text-muted-foreground",
      caption: "text-xs leading-4 text-muted-foreground",
      label: "text-label text-muted-foreground",
      mono: "font-mono text-xs tabular-nums text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

function Text({
  className,
  variant = "body",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof textVariants>) {
  return <p className={cn(textVariants({ variant }), className)} {...props} />
}

function Metric({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-metric", className)} {...props} />
}

export { Heading, Metric, Text, headingVariants, textVariants }
