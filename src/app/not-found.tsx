import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { EmptyState } from "@/components/feedback/empty-state"
import { MedOSBrand } from "@/components/navigation/medos-brand"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-page">
      <div className="w-full max-w-xl">
        <div className="mx-auto mb-6 w-fit"><MedOSBrand /></div>
        <EmptyState icon={FileQuestion} title="Workspace not found" description="The page or synthetic patient record you requested is unavailable." action={<Button render={<Link href="/dashboard" />}>Return to command center</Button>} />
      </div>
    </main>
  )
}
