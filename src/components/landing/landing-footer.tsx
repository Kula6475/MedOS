import Link from "next/link"

import { MedOSBrand } from "@/components/navigation"

function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" aria-label="MedOS home">
            <MedOSBrand />
          </Link>
          <p className="mt-4 max-w-md text-xs leading-5 text-muted-foreground">
            MedOS is a clinical decision support proof of concept using entirely synthetic data. It is not medical advice, a medical device, or a replacement for licensed clinicians.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-semibold">
            <span className="text-provider">Fireworks powers the intelligence;</span>{" "}
            <span className="text-trust">Braintrust builds trust.</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">© 2026 MedOS. Built for trustworthy emergency operations.</p>
        </div>
      </div>
    </footer>
  )
}

export { LandingFooter }
