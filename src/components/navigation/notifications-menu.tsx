"use client"

import Link from "next/link"
import { AlertTriangle, Bell } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { emergencyAlerts } from "@/lib/mock-hospital-data"
import { cn } from "@/lib/utils"

function NotificationsMenu() {
  const unread = emergencyAlerts.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Notifications, ${unread} unread`} className="relative" />}
      >
        <Bell />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 grid size-3.5 place-items-center rounded-full bg-critical text-[0.55rem] font-semibold text-critical-foreground ring-2 ring-background"
          >
            {unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
          <span className="text-xs font-semibold text-foreground">Notifications</span>
          <Badge variant="replay">Mock feed</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0" />
        <div className="max-h-80 overflow-y-auto p-1.5">
          {emergencyAlerts.map((alert) => (
            <DropdownMenuItem key={alert.title} className="flex-col items-start gap-1 rounded-lg px-2.5 py-2.5">
              <div className="flex w-full items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md",
                    alert.tone === "critical" ? "bg-critical/12 text-critical" : alert.tone === "warning" ? "bg-warning/12 text-warning" : "bg-info/12 text-info"
                  )}
                >
                  <AlertTriangle className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{alert.title}</p>
                  <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">{alert.detail}</p>
                </div>
                <span className="shrink-0 text-[0.62rem] text-muted-foreground">{alert.time}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <div className="p-1.5">
          <DropdownMenuItem render={<Link href="/dashboard" />} className="justify-center text-xs font-medium text-primary">
            View all alerts
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { NotificationsMenu }
