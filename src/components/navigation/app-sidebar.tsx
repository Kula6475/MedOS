"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck } from "lucide-react"

import { StatusPulse } from "@/components/motion"
import { MedOSBrand } from "@/components/navigation/medos-brand"
import { primaryNavigation } from "@/components/navigation/navigation-items"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3">
        <Link href="/" aria-label="MedOS command center">
          <MedOSBrand compact={collapsed} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavigation.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname.startsWith("/dashboard") || pathname.startsWith("/patients")
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      tooltip={item.label}
                      className="h-10 rounded-lg px-3"
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-trust/8 px-2.5 py-2 text-trust ring-1 ring-trust/18 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              Braintrust demo
              <StatusPulse tone="trust" />
            </div>
            <p className="truncate text-[0.65rem] text-muted-foreground">
              Mock observability
            </p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { AppSidebar }
