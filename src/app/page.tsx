import type { Metadata } from "next"

import { FeatureSection } from "@/components/landing/feature-section"
import { HeroSection } from "@/components/landing/hero-section"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { SponsorSection } from "@/components/landing/sponsor-section"
import { TrustSection } from "@/components/landing/trust-section"

export const metadata: Metadata = {
  title: "Emergency care, orchestrated",
  description:
    "MedOS helps emergency teams prioritize risk, coordinate care, and inspect every AI recommendation through Braintrust-powered evaluation.",
}

export default function Home() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <a href="#main-content" className="sr-only fixed top-3 left-3 z-[100] rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only">Skip to main content</a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <FeatureSection />
        <TrustSection />
        <SponsorSection />
      </main>
      <LandingFooter />
    </div>
  )
}
