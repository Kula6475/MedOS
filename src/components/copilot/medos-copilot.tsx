"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"

const MedOSCopilotExperience = dynamic(
  () => import("./medos-copilot-experience").then((module) => module.MedOSCopilotExperience),
  { ssr: false },
)

type MedOSCopilotProviderProps = {
  children: ReactNode
  configured: boolean
}

type OptionalBoundaryProps = { children: ReactNode }
type OptionalBoundaryState = { failed: boolean }

class OptionalCopilotBoundary extends Component<OptionalBoundaryProps, OptionalBoundaryState> {
  state: OptionalBoundaryState = { failed: false }

  static getDerivedStateFromError(): OptionalBoundaryState {
    return { failed: true }
  }

  componentDidCatch() {
    // Copilot is optional. Avoid logging vendor errors or request details that could contain
    // configuration data; the primary MedOS workspace remains fully operational.
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function MedOSCopilotProvider({ children, configured }: MedOSCopilotProviderProps) {
  return (
    <>
      {children}
      {configured ? (
        <OptionalCopilotBoundary>
          <MedOSCopilotExperience />
        </OptionalCopilotBoundary>
      ) : null}
    </>
  )
}
