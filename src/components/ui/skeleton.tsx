import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/75 after:absolute after:inset-0 after:-translate-x-full after:animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] after:bg-linear-to-r after:from-transparent after:via-foreground/7 after:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
