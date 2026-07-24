import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("min-h-32", className)} aria-label="Loading metric">
      <CardHeader>
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <Card className={cn("gap-0", className)} aria-label="Loading table">
      <CardHeader className="border-b pb-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52" />
      </CardHeader>
      <CardContent className="space-y-0 px-0">
        <div className="grid grid-cols-4 gap-4 bg-muted/35 px-4 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid min-h-12 grid-cols-4 items-center gap-4 border-t px-4"
          >
            {Array.from({ length: 4 }).map((_, column) => (
              <Skeleton
                key={column}
                className={cn("h-3", column === 0 ? "w-3/4" : "w-full")}
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DetailPanelSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className} aria-label="Loading details">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  )
}

function AppShellSkeleton() {
  return (
    <div className="flex min-h-svh bg-background" aria-hidden="true">
      <div className="hidden w-64 border-r bg-sidebar p-4 md:block">
        <Skeleton className="h-10 w-36" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex h-16 items-center border-b px-page">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid gap-section p-page md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export {
  AppShellSkeleton,
  DetailPanelSkeleton,
  MetricCardSkeleton,
  TableSkeleton,
}
