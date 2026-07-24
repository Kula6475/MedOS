"use client"

import Link from "next/link"
import { FlaskConical, Settings, ShieldCheck, UserRound } from "lucide-react"

import { StatusPulse } from "@/components/motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const syntheticUser = {
  name: "Dr. Maya Morgan",
  role: "Emergency Medicine · Attending",
  initials: "MM",
}

function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Account menu for ${syntheticUser.name}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/18"
          />
        }
      >
        {syntheticUser.initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0">
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-semibold text-primary ring-1 ring-primary/25">
            {syntheticUser.initials}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 truncate text-xs font-semibold text-foreground">
              {syntheticUser.name}
              <StatusPulse tone="success" />
            </span>
            <span className="mt-0.5 block truncate text-[0.66rem] text-muted-foreground">{syntheticUser.role}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0" />
        <div className="p-1.5">
          <DropdownMenuItem render={<Link href="/settings" />} className="gap-2.5 rounded-lg px-2.5 py-2">
            <Settings className="size-3.5 text-muted-foreground" />
            Workspace settings
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/trust" />} className="gap-2.5 rounded-lg px-2.5 py-2">
            <ShieldCheck className="size-3.5 text-muted-foreground" />
            Trust Center
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="gap-2.5 rounded-lg px-2.5 py-2 opacity-60">
            <UserRound className="size-3.5 text-muted-foreground" />
            My profile
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <div className="flex items-start gap-2 p-3 text-[0.65rem] leading-4 text-muted-foreground">
          <FlaskConical className="mt-0.5 size-3 shrink-0" />
          Synthetic demo session — no real clinician account or credentials are attached.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ProfileMenu }
