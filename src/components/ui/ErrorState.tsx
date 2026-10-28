import { CloudOff, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-card border border-line bg-surface px-6 py-14 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
        <CloudOff aria-hidden className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-[0.9375rem] leading-relaxed text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          <RefreshCw aria-hidden className="size-4" /> Try again
        </Button>
      )}
    </div>
  )
}
