import { LoaderCircle } from 'lucide-react'

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-canvas">
      <LoaderCircle aria-hidden className="size-6 animate-spin text-muted" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
