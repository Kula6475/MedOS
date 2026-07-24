"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, FlaskConical, Search, ShieldCheck } from "lucide-react"

import { StatusPulse } from "@/components/motion"
import { NotificationsMenu } from "@/components/navigation/notifications-menu"
import { ProfileMenu } from "@/components/navigation/profile-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type Breadcrumb = { label: string; href?: string }

type TopNavigationProps = {
  title: string
  eyebrow?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  className?: string
}

function HeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/patients?q=${encodeURIComponent(trimmed)}` : "/patients")
  }

  return (
    <form onSubmit={submitSearch} role="search" className="hidden min-w-0 max-w-64 flex-1 lg:block">
      <label className="sr-only" htmlFor="header-patient-search">Search patients</label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="header-patient-search"
          type="search"
          placeholder="Search patients, MRN, complaint…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>
    </form>
  )
}

function TopNavigation({
  title,
  eyebrow,
  breadcrumbs,
  actions,
  className,
}: TopNavigationProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-background/88 px-page backdrop-blur-xl",
        className
      )}
    >
      <SidebarTrigger aria-label="Toggle navigation" />
      <Separator orientation="vertical" className="h-5" />

      <div className="min-w-0 shrink-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-label text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="truncate normal-case tracking-normal transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          eyebrow && <p className="text-label truncate text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="truncate text-sm font-semibold tracking-[-0.012em]">
          {title}
        </h1>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:justify-between">
        <HeaderSearch />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search patients"
            className="lg:hidden"
            onClick={() => router.push("/patients")}
          >
            <Search />
          </Button>

          <div className="hidden items-center gap-1.5 rounded-lg bg-card/75 px-2.5 py-1 text-[0.68rem] ring-1 ring-border sm:flex">
            <StatusPulse tone="success" />
            <span className="text-muted-foreground">All systems</span>
            <span className="font-medium text-success">Operational</span>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
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

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <NotificationsMenu />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

export { TopNavigation, type TopNavigationProps }
