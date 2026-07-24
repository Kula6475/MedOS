import Link from "next/link"
import { Menu } from "lucide-react"

import { MedOSBrand } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const navigation = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#workflow" },
  { label: "Trust layer", href: "#trust" },
  { label: "Partners", href: "#partners" },
]

function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-border bg-background/82 px-4 shadow-float backdrop-blur-2xl sm:px-5">
        <Link href="/" aria-label="MedOS home" className="shrink-0">
          <MedOSBrand />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant="live">System online</Badge>
          <Button render={<Link href="/dashboard" />}>
            See the platform
          </Button>
        </div>

        <details className="group relative sm:hidden">
          <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-card text-foreground [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <nav className="absolute top-12 right-0 flex w-64 flex-col gap-1 rounded-xl border bg-popover p-2 shadow-float">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <Button className="mt-1" render={<Link href="/dashboard" />}>
              See the platform
            </Button>
          </nav>
        </details>
      </div>
    </header>
  )
}

export { LandingHeader }
