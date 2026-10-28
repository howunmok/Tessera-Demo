import { clsx } from 'clsx'
import { Check, CircleAlert, CloudOff, LoaderCircle } from 'lucide-react'
import type { SaveState } from '@/hooks/useCardAutosave'
import { formatTime } from '@/utils/time'

const LABELS: Record<SaveState, string> = {
  saved: 'Saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  invalid: 'Fix errors to save',
  error: 'Couldn’t save',
}

export function SaveStatus({
  state,
  lastSavedAt,
  onRetry,
  onShowErrors,
}: {
  state: SaveState
  lastSavedAt: Date | null
  onRetry: () => void
  /** Jumps to the tab with the invalid field. */
  onShowErrors: () => void
}) {
  const problem = state === 'invalid' || state === 'error'

  return (
    <div className="flex items-center gap-2">
      <p
        role="status"
        aria-live="polite"
        title={lastSavedAt ? `Last saved at ${formatTime(lastSavedAt)}` : undefined}
        className={clsx(
          'inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap',
          problem ? 'text-danger' : 'text-muted',
        )}
      >
        {state === 'saved' && <Check aria-hidden className="size-4 text-success" />}
        {state === 'unsaved' && (
          <span aria-hidden className="mx-1 size-1.5 rounded-full bg-brass" />
        )}
        {state === 'saving' && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {state === 'invalid' && <CircleAlert aria-hidden className="size-4" />}
        {state === 'error' && <CloudOff aria-hidden className="size-4" />}
        <span className={clsx(state === 'saved' && 'max-sm:sr-only')}>{LABELS[state]}</span>
      </p>
      {state === 'error' && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full px-2 py-1 text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          Retry
        </button>
      )}
      {state === 'invalid' && (
        <button
          type="button"
          onClick={onShowErrors}
          className="rounded-full px-2 py-1 text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          Show
        </button>
      )}
    </div>
  )
}
