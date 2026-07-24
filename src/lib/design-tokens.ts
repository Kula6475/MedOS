export const spacingTokens = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  page: "var(--page-gutter)",
  section: "var(--section-gap)",
  panel: "var(--panel-padding)",
} as const

export const semanticColorTokens = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  critical: "var(--critical)",
  info: "var(--info)",
  trust: "var(--trust)",
  provider: "var(--provider)",
} as const

export const motionTokens = {
  fast: 0.14,
  standard: 0.18,
  deliberate: 0.24,
  easeOut: [0.22, 1, 0.36, 1],
} as const
