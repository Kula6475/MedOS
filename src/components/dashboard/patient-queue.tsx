"use client"

import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, ArrowUpRight, Clock3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { DataTableFrame } from "@/components/design-system/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { syntheticPatients, type PatientAcuity } from "@/lib/mock-hospital-data"

const acuityVariant: Record<PatientAcuity, "critical" | "warning" | "info" | "neutral"> = {
  "ESI 1": "critical",
  "ESI 2": "warning",
  "ESI 3": "info",
  "ESI 4": "neutral",
}

function PatientQueue() {
  const reduceMotion = useReducedMotion()
  const router = useRouter()

  return (
    <DataTableFrame
      title="Patient queue"
      description="Acuity-ranked emergency department census"
      action={<Button variant="ghost" size="xs" render={<Link href="/patients" />}>View full queue<ArrowUpRight /></Button>}
      className="min-w-0"
    >
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Acuity</TableHead>
              <TableHead>Clinical snapshot</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Wait</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syntheticPatients.map((patient, index) => (
              <motion.tr
                key={patient.id}
                className="cursor-pointer border-b transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 data-[state=selected]:bg-muted"
                onClick={() => router.push(`/patients/${patient.id}`)}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.25 + index * 0.055 }}
              >
                <TableCell className="min-w-48 py-3.5">
                  <Link href={`/patients/${patient.id}`} className="font-medium underline-offset-4 hover:text-primary hover:underline" onClick={(event) => event.stopPropagation()}>{patient.name}</Link>
                  <div className="mt-0.5 text-xs text-muted-foreground">{patient.id} · {patient.age}{patient.sex}</div>
                </TableCell>
                <TableCell><Badge variant={acuityVariant[patient.acuity]}>{patient.acuity}</Badge></TableCell>
                <TableCell className="min-w-64">
                  <div className="text-sm">{patient.chiefComplaint}</div>
                  <div className="mt-1 font-mono text-[0.67rem] text-muted-foreground">{patient.vitals}</div>
                  {patient.alerts.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[0.68rem] font-medium text-warning">
                      <AlertTriangle className="size-3" /> {patient.alerts[0]}
                    </div>
                  )}
                </TableCell>
                <TableCell className="min-w-32">
                  <div>{patient.location}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{patient.status}</div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  <span className="inline-flex items-center gap-1"><Clock3 className="size-3 text-muted-foreground" />{patient.waitMinutes}m</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
      </Table>
    </DataTableFrame>
  )
}

export { PatientQueue }
