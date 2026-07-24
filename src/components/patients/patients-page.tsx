"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Clock3,
  MapPin,
  Search,
  SearchX,
  X,
} from "lucide-react"

import { TableSkeleton } from "@/components/feedback/loading-skeletons"
import { EmptyState } from "@/components/feedback/empty-state"
import { PageReveal } from "@/components/motion"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTableFrame } from "@/components/design-system/data-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  syntheticPatients,
  type AgentAnalysisStatus,
  type PatientAcuity,
  type PatientStatus,
  type SyntheticPatient,
} from "@/lib/mock-hospital-data"
import { cn } from "@/lib/utils"

type BadgeVariant = NonNullable<Parameters<typeof badgeVariants>[0]>["variant"]

const acuityVariant: Record<PatientAcuity, BadgeVariant> = {
  "ESI 1": "critical",
  "ESI 2": "warning",
  "ESI 3": "info",
  "ESI 4": "neutral",
}

const acuityDescription: Record<PatientAcuity, string> = {
  "ESI 1": "Immediate, life-threatening",
  "ESI 2": "High-risk, time-sensitive",
  "ESI 3": "Urgent, stable",
  "ESI 4": "Lower acuity",
}

const statusVariant: Record<PatientStatus, BadgeVariant> = {
  Resuscitation: "critical",
  "Awaiting ICU": "warning",
  "Under evaluation": "info",
  Imaging: "info",
  Treatment: "neutral",
}

const analysisVariant: Record<AgentAnalysisStatus, BadgeVariant> = {
  Complete: "success",
  "In progress": "live",
  "Not started": "neutral",
}

function departmentOf(patient: SyntheticPatient): string {
  if (patient.location.startsWith("Trauma")) return "Resuscitation"
  if (patient.location.startsWith("Neuro")) return "Neuro Unit"
  if (patient.location.startsWith("Fast")) return "Fast Track"
  return "General ED"
}

const departments = ["Resuscitation", "General ED", "Neuro Unit", "Fast Track"] as const
const severities: PatientAcuity[] = ["ESI 1", "ESI 2", "ESI 3", "ESI 4"]
const statuses: PatientStatus[] = ["Resuscitation", "Awaiting ICU", "Under evaluation", "Imaging", "Treatment"]

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary/35 bg-primary/10 text-primary" : "border-border bg-muted/25 text-muted-foreground hover:bg-muted/45 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "")
  const [severityFilter, setSeverityFilter] = useState<Set<PatientAcuity>>(new Set())
  const [statusFilter, setStatusFilter] = useState<Set<PatientStatus>>(new Set())
  const [department, setDepartment] = useState<string>("all")
  const [sortDir, setSortDir] = useState<"longest" | "recent">("longest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 480)
    return () => window.clearTimeout(timer)
  }, [])

  function toggleSet<T>(set: Set<T>, value: T, setter: (next: Set<T>) => void) {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setter(next)
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const result = syntheticPatients.filter((patient) => {
      const matchesQuery = normalizedQuery.length === 0 ||
        patient.name.toLowerCase().includes(normalizedQuery) ||
        patient.id.toLowerCase().includes(normalizedQuery) ||
        patient.chiefComplaint.toLowerCase().includes(normalizedQuery)
      const matchesSeverity = severityFilter.size === 0 || severityFilter.has(patient.acuity)
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(patient.status)
      const matchesDepartment = department === "all" || departmentOf(patient) === department
      return matchesQuery && matchesSeverity && matchesStatus && matchesDepartment
    })

    return result.sort((a, b) => sortDir === "longest" ? b.waitMinutes - a.waitMinutes : a.waitMinutes - b.waitMinutes)
  }, [query, severityFilter, statusFilter, department, sortDir])

  const hasActiveFilters = query.trim().length > 0 || severityFilter.size > 0 || statusFilter.size > 0 || department !== "all"

  function clearFilters() {
    setQuery("")
    setSeverityFilter(new Set())
    setStatusFilter(new Set())
    setDepartment("all")
    router.replace("/patients")
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-section pb-8">
      <PageReveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2"><Badge variant="replay">Synthetic replay</Badge><span className="text-xs text-muted-foreground">{filtered.length} of {syntheticPatients.length} patients</span></div>
          <h2 className="text-title">Patient queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search, filter, and sort the full synthetic emergency department census.</p>
        </div>
      </PageReveal>

      <PageReveal delay={0.04}>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search by name, MRN, or chief complaint…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-9 pl-8 text-sm"
                  aria-label="Search patients"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  aria-label="Filter by department"
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="all">All departments</option>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDir((current) => current === "longest" ? "recent" : "longest")}
                  aria-label={`Sort by ${sortDir === "longest" ? "most recent arrival" : "longest wait"}`}
                >
                  {sortDir === "longest" ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
                  {sortDir === "longest" ? "Longest wait" : "Most recent"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">Severity</span>
              {severities.map((item) => (
                <ToggleChip key={item} active={severityFilter.has(item)} onClick={() => toggleSet(severityFilter, item, setSeverityFilter)}>{item}</ToggleChip>
              ))}
              <span className="mr-1 ml-3 text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">Status</span>
              {statuses.map((item) => (
                <ToggleChip key={item} active={statusFilter.has(item)} onClick={() => toggleSet(statusFilter, item, setStatusFilter)}>{item}</ToggleChip>
              ))}
              {hasActiveFilters && (
                <Button variant="ghost" size="xs" onClick={clearFilters} className="ml-1 text-muted-foreground">
                  <X />Clear filters
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-[0.68rem] text-muted-foreground">
              <span className="font-medium text-foreground">Severity legend</span>
              {severities.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Badge variant={acuityVariant[item]}>{item}</Badge>
                  {acuityDescription[item]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageReveal>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <PageReveal delay={0.06}>
          <EmptyState
            icon={SearchX}
            title="No patients match these filters"
            description="Try clearing a filter or searching a different name, MRN, or chief complaint."
            action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
          />
        </PageReveal>
      ) : (
        <PageReveal delay={0.06}>
          <DataTableFrame title="Results" description={`${filtered.length} matching patients, sorted by ${sortDir === "longest" ? "longest wait" : "most recent arrival"}`} className="hidden lg:flex">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Acuity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chief complaint</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>AI analysis</TableHead>
                  <TableHead className="text-right">Wait</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((patient) => (
                  <TableRow key={patient.id} className="group cursor-pointer transition-colors hover:bg-muted/50" onClick={() => router.push(`/patients/${patient.id}`)}>
                    <TableCell className="min-w-48 py-3.5">
                      <Link href={`/patients/${patient.id}`} className="font-medium underline-offset-4 hover:text-primary hover:underline" onClick={(event) => event.stopPropagation()}>{patient.name}</Link>
                      <div className="mt-0.5 text-xs text-muted-foreground">{patient.id} · {patient.age}{patient.sex}</div>
                    </TableCell>
                    <TableCell><Badge variant={acuityVariant[patient.acuity]}>{patient.acuity}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant[patient.status]}>{patient.status}</Badge></TableCell>
                    <TableCell className="min-w-48">
                      <div className="text-sm">{patient.chiefComplaint}</div>
                      {patient.alerts.length > 0 && <div className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium text-warning"><AlertTriangle className="size-3" />{patient.alerts[0]}</div>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{departmentOf(patient)}</TableCell>
                    <TableCell><Badge variant={analysisVariant[patient.analysisStatus]}>{patient.analysisStatus}</Badge></TableCell>
                    <TableCell className="text-right font-mono tabular-nums"><span className="inline-flex items-center gap-1"><Clock3 className="size-3 text-muted-foreground" />{patient.waitMinutes}m</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="xs" render={<Link href={`/patients/${patient.id}`} onClick={(event) => event.stopPropagation()} />}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableFrame>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filtered.map((patient, index) => (
              <PageReveal key={patient.id} delay={index * 0.03}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      router.push(`/patients/${patient.id}`)
                    }
                  }}
                  className="h-full cursor-pointer transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-float"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm">{patient.name}</CardTitle>
                      <Badge variant={acuityVariant[patient.acuity]}>{patient.acuity}</Badge>
                    </div>
                    <CardDescription>{patient.id} · {patient.age}{patient.sex}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <p className="text-sm font-medium">{patient.chiefComplaint}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={statusVariant[patient.status]}>{patient.status}</Badge>
                      <Badge variant={analysisVariant[patient.analysisStatus]}>{patient.analysisStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{patient.location}</span>
                      <span className="flex items-center gap-1"><Clock3 className="size-3" />{patient.waitMinutes}m wait</span>
                    </div>
                  </CardContent>
                </Card>
              </PageReveal>
            ))}
          </div>
        </PageReveal>
      )}

      <PageReveal delay={0.14} className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>All patient names and clinical records shown are synthetic.</span>
        <span>MedOS is clinical decision support—not medical advice or autonomous care.</span>
      </PageReveal>
    </div>
  )
}

export { PatientsPage }
