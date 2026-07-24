"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  Flame,
  Info,
  KeyRound,
  Laptop,
  Mail,
  Moon,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
} from "lucide-react"

import { MedOSBrand } from "@/components/navigation/medos-brand"
import { PageReveal } from "@/components/motion"
import { applyTheme, type ThemePreference } from "@/components/settings/theme-initializer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type NotificationKey = "critical" | "agent" | "capacity" | "digest"

const sections = [
  { id: "appearance", label: "Theme", icon: Sun },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "braintrust", label: "Braintrust", icon: ShieldCheck },
  { id: "fireworks", label: "Fireworks AI", icon: Flame },
  { id: "api", label: "API placeholders", icon: Code2 },
  { id: "hospital", label: "Hospital profile", icon: Building2 },
  { id: "about", label: "About", icon: Info },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <PageReveal delay={delay}>{children}</PageReveal>
}

function Toggle({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onCheckedChange(!checked)} className={cn("relative h-6 w-11 shrink-0 rounded-full ring-1 transition-colors", checked ? "bg-primary ring-primary" : "bg-muted ring-border")}>
      <motion.span animate={{ x: checked ? 21 : 3 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 left-0 size-4 rounded-full bg-white shadow-sm" />
    </button>
  )
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium">{label}</span>{description && <span className="ml-2 text-[0.65rem] text-muted-foreground">{description}</span>}<div className="mt-1.5">{children}</div></label>
}

const selectClass = "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function SecretField({ placeholder }: { placeholder: string }) {
  const [visible, setVisible] = useState(false)
  return <div className="relative"><Input type={visible ? "text" : "password"} value={placeholder} readOnly aria-label="Mock API key placeholder" className="pr-9 font-mono text-xs text-muted-foreground" /><Button type="button" variant="ghost" size="icon-xs" aria-label={visible ? "Hide placeholder" : "Show placeholder"} onClick={() => setVisible(!visible)} className="absolute top-1/2 right-1 -translate-y-1/2">{visible ? <EyeOff /> : <Eye />}</Button></div>
}

function SettingsPage() {
  const [theme, setTheme] = useState<ThemePreference>("dark")
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({ critical: true, agent: true, capacity: true, digest: false })
  const [saved, setSaved] = useState(false)
  const [testState, setTestState] = useState<"idle" | "testing" | "success">("idle")

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("medos-theme") as ThemePreference | null
    const storedNotifications = window.localStorage.getItem("medos-notifications")
    if (storedTheme) setTheme(storedTheme)
    if (storedNotifications) {
      try { setNotifications(JSON.parse(storedNotifications) as Record<NotificationKey, boolean>) } catch { /* keep safe defaults */ }
    }
  }, [])

  function updateTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  function savePreferences() {
    window.localStorage.setItem("medos-theme", theme)
    window.localStorage.setItem("medos-notifications", JSON.stringify(notifications))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  function simulateTest() {
    setTestState("testing")
    window.setTimeout(() => setTestState("success"), 900)
  }

  return (
    <div className="mx-auto max-w-[1400px] pb-10">
      <Reveal><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge variant="neutral" className="mb-2">Workspace controls</Badge><h2 className="text-title">Settings</h2><p className="mt-1 text-sm text-muted-foreground">Configure local preferences and preview integration settings.</p></div><div className="flex items-center gap-3"><AnimatePresence>{saved && <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="size-3.5" />Preferences saved locally</motion.span>}</AnimatePresence><Button onClick={savePreferences}><Save />Save preferences</Button></div></div></Reveal>

      <div className="grid items-start gap-section lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Reveal delay={0.04}><nav aria-label="Settings sections" className="sticky top-20 hidden rounded-xl bg-card p-2 ring-1 ring-border lg:block">{sections.map((section) => <a key={section.id} href={`#${section.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><section.icon className="size-3.5" />{section.label}<ChevronRight className="ml-auto size-3" /></a>)}</nav></Reveal>

        <div className="min-w-0 space-y-section">
          <Reveal delay={0.06}><Card id="appearance"><CardHeader><CardTitle className="flex items-center gap-2"><Sun className="size-4 text-primary" />Theme</CardTitle><CardDescription>Choose how MedOS appears on this device.</CardDescription><CardAction><Badge variant="success">Saved locally</Badge></CardAction></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{([
            { value: "system" as const, label: "System", description: "Match your device", icon: Laptop },
            { value: "dark" as const, label: "Clinical dark", description: "Optimized for command centers", icon: Moon },
            { value: "light" as const, label: "Daylight", description: "High-clarity light mode", icon: Sun },
          ]).map((option) => <button key={option.value} type="button" onClick={() => updateTheme(option.value)} aria-pressed={theme === option.value} className={cn("relative rounded-xl p-4 text-left ring-1 transition-all", theme === option.value ? "bg-primary/8 ring-primary/35 shadow-panel" : "bg-muted/20 ring-border hover:bg-muted/40")}><option.icon className={cn("size-5", theme === option.value ? "text-primary" : "text-muted-foreground")} /><p className="mt-4 text-sm font-semibold">{option.label}</p><p className="mt-1 text-[0.68rem] text-muted-foreground">{option.description}</p>{theme === option.value && <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}</button>)}</CardContent></Card></Reveal>

          <Reveal delay={0.08}><Card id="notifications"><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-4 text-info" />Notifications</CardTitle><CardDescription>Control the alerts shown in this demo workspace.</CardDescription></CardHeader><CardContent className="divide-y">{[
            { key: "critical" as const, title: "Critical patient alerts", detail: "ESI 1 escalation, sepsis, stroke, and medication safety", icon: Smartphone },
            { key: "agent" as const, title: "Agent workflow updates", detail: "Analysis completion and human-review requirements", icon: BrainCircuit },
            { key: "capacity" as const, title: "Capacity thresholds", detail: "ICU beds, department census, and wait-time thresholds", icon: Building2 },
            { key: "digest" as const, title: "Shift summary email", detail: "Synthetic operational digest at handoff", icon: Mail },
          ].map((item) => <div key={item.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground"><item.icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium">{item.title}</p><p className="mt-0.5 text-[0.66rem] text-muted-foreground">{item.detail}</p></div><Toggle checked={notifications[item.key]} onCheckedChange={(checked) => setNotifications((current) => ({ ...current, [item.key]: checked }))} label={item.title} /></div>)}</CardContent></Card></Reveal>

          <Reveal delay={0.1}><Card id="braintrust" variant="trust" className="bg-gradient-to-br from-trust/8 via-card to-card"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-trust" />Braintrust configuration</CardTitle><CardDescription>Mock observability configuration for the hackathon demo.</CardDescription><CardAction><Badge variant="replay">Mock only</Badge></CardAction></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Project"><Input defaultValue="MedOS Clinical Agents" /></Field><Field label="Environment"><select className={selectClass} defaultValue="demo"><option value="demo">Demo / Replay</option><option value="staging">Staging</option><option value="production">Production placeholder</option></select></Field><Field label="API endpoint"><Input defaultValue="https://api.braintrust.dev" className="font-mono text-xs" /></Field><Field label="API key" description="Placeholder only"><SecretField placeholder="bt_mock_not_a_real_key" /></Field></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-trust/7 p-3 ring-1 ring-trust/15"><div><p className="text-xs font-medium">Trace and evaluation preview</p><p className="mt-0.5 text-[0.65rem] text-muted-foreground">Testing is simulated locally; no Braintrust request is sent.</p></div><Button variant="trust" size="sm" onClick={simulateTest} disabled={testState === "testing"}>{testState === "testing" ? "Testing…" : testState === "success" ? <><CheckCircle2 />Mock connection ready</> : "Test mock configuration"}</Button></div></CardContent></Card></Reveal>

          <Reveal delay={0.12}><Card id="fireworks" className="bg-gradient-to-br from-provider/7 via-card to-card"><CardHeader><CardTitle className="flex items-center gap-2"><Flame className="size-4 text-provider" />Fireworks AI configuration</CardTitle><CardDescription>Mock inference defaults. No model requests are made from this page.</CardDescription><CardAction><Badge variant="replay">Mock only</Badge></CardAction></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Field label="Default model"><select className={selectClass} defaultValue="llama"><option value="llama">llama-v3p3-70b-instruct</option><option value="mixtral">mixtral-8x22b placeholder</option></select></Field><Field label="Inference region"><select className={selectClass} defaultValue="west"><option value="west">US West</option><option value="east">US East</option></select></Field><Field label="Request timeout"><Input defaultValue="15 seconds" /></Field><Field label="API key" description="Placeholder only"><SecretField placeholder="fw_mock_not_a_real_key" /></Field></CardContent></Card></Reveal>

          <Reveal delay={0.14}><Card id="api"><CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="size-4 text-warning" />API placeholders</CardTitle><CardDescription>Future server-side integration points. Values are not persisted or transmitted.</CardDescription><CardAction><Badge variant="neutral">Not connected</Badge></CardAction></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="FHIR R4 base URL"><Input placeholder="https://fhir.hospital.example/r4" className="font-mono text-xs" /></Field><Field label="Operations API"><Input placeholder="https://api.hospital.example/operations" className="font-mono text-xs" /></Field><Field label="Alert webhook"><Input placeholder="https://hooks.hospital.example/medos" className="font-mono text-xs" /></Field><Field label="Webhook signing secret"><SecretField placeholder="not_configured" /></Field></div><div className="flex gap-2 rounded-lg bg-warning/7 p-3 text-[0.67rem] leading-5 text-muted-foreground ring-1 ring-warning/15"><KeyRound className="mt-0.5 size-3.5 shrink-0 text-warning" />Production credentials belong in server-only environment variables or managed secret storage. MedOS never exposes API keys in browser configuration.</div></CardContent></Card></Reveal>

          <Reveal delay={0.16}><Card id="hospital"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4 text-primary" />Hospital profile</CardTitle><CardDescription>Synthetic organization details used throughout the demonstration.</CardDescription><CardAction><Badge variant="neutral">Synthetic</Badge></CardAction></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Field label="Organization name"><Input defaultValue="Northstar Medical Center" /></Field><Field label="Campus"><Input defaultValue="San Francisco Campus" /></Field><Field label="Department"><Input defaultValue="Emergency Medicine" /></Field><Field label="Timezone"><select className={selectClass} defaultValue="pacific"><option value="pacific">America/Los_Angeles</option><option value="mountain">America/Denver</option><option value="central">America/Chicago</option><option value="eastern">America/New_York</option></select></Field><Field label="Licensed beds"><Input defaultValue="264" inputMode="numeric" /></Field><Field label="Emergency department capacity"><Input defaultValue="58 staffed bays" /></Field></CardContent></Card></Reveal>

          <Reveal delay={0.18}><Card id="about"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="size-4 text-info" />About MedOS</CardTitle><CardDescription>Product and safety information.</CardDescription></CardHeader><CardContent><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="rounded-xl bg-background p-4 ring-1 ring-border"><MedOSBrand /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">MedOS Clinical Command Center</p><p className="mt-1 text-xs leading-5 text-muted-foreground">AI-powered emergency department operations proof of concept focused on transparent, auditable clinical decision support.</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="neutral">Version 0.1.0</Badge><Badge variant="neutral">Next.js 15</Badge><Badge variant="neutral">Synthetic data</Badge></div></div></div><div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2"><div className="rounded-lg bg-muted/25 p-3"><p className="text-xs font-medium">Safety</p><p className="mt-1 text-[0.67rem] leading-4 text-muted-foreground">MedOS is clinical decision support—not medical advice, a medical device, or autonomous care.</p></div><div className="rounded-lg bg-muted/25 p-3"><p className="text-xs font-medium">Trust statement</p><p className="mt-1 text-[0.67rem] leading-4 text-muted-foreground">Fireworks powers the intelligence; Braintrust builds trust.</p></div></div></CardContent></Card></Reveal>
        </div>
      </div>
    </div>
  )
}

export { SettingsPage }
