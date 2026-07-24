import { ChartNoAxesCombined, LayoutDashboard, Settings, ShieldCheck, type LucideIcon } from "lucide-react"

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
