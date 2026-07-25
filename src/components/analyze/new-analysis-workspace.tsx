"use client"

import { useRef, useState } from "react"
import {
  AlertTriangle,
  Braces,
  FileText,
  FlaskConical,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react"

import { PageReveal } from "@/components/motion"
import { AgentWorkflow } from "@/components/patient/agent-workflow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EXAMPLE_SCENARIOS } from "@/lib/intake/example-scenarios"
import type { PatientRecord } from "@/lib/schemas"
import { cn } from "@/lib/utils"

type Mode = "note" | "json"

interface IntakeMeta {
  source: "ai-intake" | "structured"
  provider?: "fireworks" | "mock"
  model?: string
  fallbackUsed?: boolean
}

const textareaClass =
  "w-full min-h-[220px] resize-y rounded-xl border bg-background/60 p-4 font-mono text-[0.78rem] leading-5 outline-none ring-primary/30 transition focus:ring-2"

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-muted/35 px-3 py-2 ring-1 ring-border">
      <p className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}

function NewAnalysisWorkspace() {
  const [mode, setMode] = useState<Mode>("note")
  const [noteText, setNoteText] = useState("")
  const [jsonText, setJsonText] = useState("")
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [meta, setMeta] = useState<IntakeMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function runIntake(payload: Record<string, unknown>) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data: unknown = await response.json()
      const body = data as { patient?: PatientRecord; source?: IntakeMeta["source"]; provider?: IntakeMeta["provider"]; model?: string; fallbackUsed?: boolean; error?: { message?: string } }
      if (!response.ok || !body.patient) {
        throw new Error(body.error?.message ?? "Could not process the provided input.")
      }
      setPatient(body.patient)
      setMeta({ source: body.source ?? "structured", provider: body.provider, model: body.model, fallbackUsed: body.fallbackUsed })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function submitNote() {
    if (!noteText.trim()) {
      setError("Enter a clinical description first, or load an example.")
      return
    }
    void runIntake({ text: noteText })
  }

  function submitJson() {
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      setError("That is not valid JSON. Check the syntax or load a sample record.")
      return
    }
    void runIntake({ patient: parsed })
  }

  async function loadSampleRecord() {
    setError(null)
    try {
      const response = await fetch("/api/patients")
      const data = (await response.json()) as { patients?: PatientRecord[] }
      if (data.patients?.length) {
        setJsonText(JSON.stringify(data.patients[0], null, 2))
      }
    } catch {
      setError("Could not load a sample record.")
    }
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    file
      .text()
      .then((content) => {
        setJsonText(content)
        setError(null)
      })
      .catch(() => setError("Could not read that file."))
  }

  function reset() {
    setPatient(null)
    setMeta(null)
    setError(null)
  }

  if (patient) {
    const d = patient.demographics
    return (
      <div className="mx-auto max-w-[1200px] space-y-section pb-8">
        <PageReveal>
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">Synthetic patient</Badge>
                    {meta?.source === "ai-intake" ? (
                      <Badge variant="live"><Wand2 data-icon="inline-start" />AI-structured intake</Badge>
                    ) : (
                      <Badge variant="trust"><Braces data-icon="inline-start" />Structured upload</Badge>
                    )}
                    {meta?.source === "ai-intake" && (
                      <Badge variant={meta.fallbackUsed ? "replay" : "live"}>
                        {meta.fallbackUsed ? "Offline fallback" : `Fireworks · ${(meta.model ?? "").split("/").pop()}`}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 text-xl"><UserRound className="size-5 text-primary" />{d.name}</CardTitle>
                  <CardDescription className="mt-1">{d.age}-year-old {d.sex === "F" ? "female" : "male"} · {patient.id} · {patient.chiefComplaint}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={reset}><RotateCcw />Analyze different data</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                <SummaryStat label="Symptoms" value={patient.symptoms.length} />
                <SummaryStat label="Vitals" value={patient.vitals.length ? "Recorded" : "None"} />
                <SummaryStat label="History" value={patient.history.length} />
                <SummaryStat label="Meds" value={patient.medications.length} />
                <SummaryStat label="Allergies" value={patient.allergies.length} />
                <SummaryStat label="Labs" value={patient.labs.length} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Structured and ready. Click <span className="font-semibold text-foreground">Analyze Patient</span> below to run the five agents live on this data.
              </p>
            </CardContent>
          </Card>
        </PageReveal>

        {/* Fresh key forces a clean workflow instance per analyzed patient. */}
        <AgentWorkflow key={patient.id} patient={patient} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-section pb-8">
      <PageReveal>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="live"><Sparkles data-icon="inline-start" />Autonomous multi-agent analysis</Badge>
              <Badge variant="neutral">Synthetic data only</Badge>
            </div>
            <CardTitle className="mt-2 text-xl">Analyze new patient data</CardTitle>
            <CardDescription className="max-w-2xl">
              Describe a patient in plain language and let AI structure it, or upload a structured JSON record. The five
              MedOS agents then evaluate it live through Fireworks, with every output validated and Braintrust-evaluated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="inline-flex rounded-lg bg-muted/50 p-1 ring-1 ring-border">
              <button
                type="button"
                onClick={() => setMode("note")}
                className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition", mode === "note" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground")}
              >
                <FileText className="size-3.5" />Clinical note (AI intake)
              </button>
              <button
                type="button"
                onClick={() => setMode("json")}
                className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition", mode === "json" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground")}
              >
                <Braces className="size-3.5" />Structured JSON
              </button>
            </div>

            {mode === "note" ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="e.g. 54-year-old male with sudden crushing chest pain radiating to the left arm, diaphoretic, HR 104, BP 158/95, SpO2 94%, ECG shows ST elevation…"
                  className={textareaClass}
                  aria-label="Free-text clinical description"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.68rem] text-muted-foreground">Try an example:</span>
                  {EXAMPLE_SCENARIOS.map((scenario) => (
                    <Button key={scenario.label} variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setNoteText(scenario.text)}>
                      <FlaskConical className="size-3" />{scenario.label}
                    </Button>
                  ))}
                </div>
                <Button size="lg" onClick={submitNote} disabled={loading}>
                  {loading ? <><LoaderCircle className="animate-spin" />Structuring with AI…</> : <><Wand2 />Structure &amp; prepare analysis</>}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={jsonText}
                  onChange={(event) => setJsonText(event.target.value)}
                  placeholder='Paste a synthetic PatientRecord JSON, or upload a .json file. Must include "isSynthetic": true.'
                  className={textareaClass}
                  aria-label="Structured patient JSON"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
                  <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}><Upload />Upload .json</Button>
                  <Button variant="ghost" size="sm" onClick={loadSampleRecord}><FlaskConical className="size-3" />Load a sample record</Button>
                </div>
                <Button size="lg" onClick={submitJson} disabled={loading}>
                  {loading ? <><LoaderCircle className="animate-spin" />Validating…</> : <><Braces />Validate &amp; prepare analysis</>}
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-critical/8 px-3 py-2.5 text-xs font-medium text-critical ring-1 ring-critical/20">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{error}
              </div>
            )}

            <p className="flex items-start gap-2 border-t pt-3 text-[0.66rem] leading-4 text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-warning" />
              For demonstration with synthetic data only. Do not enter real patient information. Output is clinical
              decision support, not medical advice, and requires clinician review.
            </p>
          </CardContent>
        </Card>
      </PageReveal>
    </div>
  )
}

export { NewAnalysisWorkspace }
