"use client"

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-page">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 text-center shadow-float ring-1 ring-border sm:p-8">
        <div className="mx-auto mb-6 w-fit text-lg font-semibold tracking-[-0.03em]">Med<span className="text-primary">OS</span></div>
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-critical/10 text-lg font-semibold text-critical ring-1 ring-critical/20" aria-hidden="true">!</span>
        <h1 className="mt-5 text-title">We couldn’t load this workspace</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Your synthetic records are unchanged. Try loading the view again or return to the command center.</p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={reset} className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/88">Try again</button><a href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted">Command center</a></div>
      </div>
    </main>
  )
}
