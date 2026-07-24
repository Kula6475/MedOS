import { Activity } from "lucide-react"

import { cn } from "@/lib/utils"

function MedOSBrand({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="size-5" strokeWidth={2.25} aria-hidden="true" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-[-0.02em]">
            MedOS
          </div>
          <div className="truncate text-[0.65rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Emergency Operations
          </div>
        </div>
      )}
    </div>
  )
}

export { MedOSBrand }
