import { BrainCircuit, ChartNoAxesCombined, FilePlus2, LayoutDashboard, Settings, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react"

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Emergency department operations overview",
  },
  {
    label: "Patients",
    href: "/patients",
    icon: UsersRound,
    description: "Full synthetic patient queue",
  },
  {
    label: "New Analysis",
    href: "/analyze",
    icon: FilePlus2,
    description: "Upload or describe a new patient for live agent analysis",
  },
  {
    label: "Agents",
    href: "/agents",
    icon: BrainCircuit,
    description: "Specialized AI agent performance and coverage",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
    description: "Operational and AI performance trends",
  },
  {
    label: "Trust Center",
    href: "/trust",
    icon: ShieldCheck,
    description: "Evaluation health and Braintrust traces",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Workspace preferences and integrations",
  },
]
