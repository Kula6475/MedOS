import * as React from "react"
import { Inbox, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  tone?: "default" | "trust" | "critical"
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  tone = "default",
  className,
  ...props
}: EmptyStateProps) {
  const tones = {
    default: "bg-muted/35 text-muted-foreground ring-border",
    trust: "bg-trust/7 text-trust ring-trust/20",
    critical: "bg-critical/7 text-critical ring-critical/20",
  }

  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-xl px-6 py-10 text-center ring-1",
        tones[tone],
        className
      )}
      {...props}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-current/10">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState, type EmptyStateProps }
