import * as React from "react"

import { AppSidebar } from "@/components/navigation/app-sidebar"
import {
  TopNavigation,
  type TopNavigationProps,
} from "@/components/navigation/top-navigation"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type AppShellProps = React.PropsWithChildren<
  TopNavigationProps & {
    contentClassName?: string
  }
>

function AppShell({
  children,
  contentClassName,
  ...navigationProps
}: AppShellProps) {
  return (
    <SidebarProvider>
      <a href="#main-content" className="sr-only fixed top-3 left-3 z-[100] rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only">Skip to main content</a>
      <AppSidebar />
      <SidebarInset>
        <TopNavigation {...navigationProps} />
        <main id="main-content" tabIndex={-1} className={cn("min-w-0 flex-1 p-page", contentClassName)}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppShell, type AppShellProps }
