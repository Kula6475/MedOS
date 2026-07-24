import * as React from "react"
import { FlaskConical, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type TopNavigationProps = {
  title: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}

function TopNavigation({
  title,
  eyebrow,
  actions,
  className,
}: TopNavigationProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-background/88 px-page backdrop-blur-xl",
        className
      )}
    >
      <SidebarTrigger aria-label="Toggle navigation" />
      <Separator orientation="vertical" className="h-5" />

      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-label truncate text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="truncate text-sm font-semibold tracking-[-0.012em]">
          {title}
        </h1>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <Badge variant="neutral">
          <FlaskConical data-icon="inline-start" />
          Synthetic data
        </Badge>
        <Badge variant="trust">
          <ShieldCheck data-icon="inline-start" />
          Braintrust demo
        </Badge>
      </div>

      {actions && <div className="hidden shrink-0 items-center gap-2 sm:flex">{actions}</div>}
    </header>
  )
}

export { TopNavigation, type TopNavigationProps }
