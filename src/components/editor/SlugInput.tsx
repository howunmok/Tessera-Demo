import { clsx } from 'clsx'
import { Check, CircleAlert, CircleX, LoaderCircle } from 'lucide-react'
import { fieldTextSize } from '@/components/ui/field-classes'
import { getPublicBaseUrl } from '@/config/app'
import type { SlugAvailability } from '@/hooks/useSlugAvailability'
import { normalizeSlugInput } from '@/utils/slug'

/** Text input with the public URL as a prefix: "card.example.com/c/[benny-lee]". */
export function SlugInput({
  id,
  value,
  onChange,
  availability,
  describedBy,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  availability: SlugAvailability
  describedBy: string
}) {
  const host = getPublicBaseUrl().replace(/^https?:\/\//, '')
  const invalid = availability.status === 'invalid' || availability.status === 'taken'

  return (
    <div
      className={clsx(
        'flex h-11 items-center overflow-hidden rounded-xl border bg-surface shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:ring-4',
        invalid
          ? 'border-danger focus-within:ring-danger/15'
          : 'border-line-strong focus-within:border-ink focus-within:ring-ink/10 hover:border-ink/30',
      )}
    >
      <span
        aria-hidden
        className={clsx('flex min-w-0 shrink pl-3.5 text-muted select-none', fieldTextSize)}
      >
        <span className="hidden max-w-56 truncate sm:inline">{host}</span>
        <span className="shrink-0">/c/</span>
      </span>
      <input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(normalizeSlugInput(event.target.value))
        }}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={clsx(
          'h-full min-w-[6rem] flex-1 bg-transparent pr-3.5 font-medium text-ink outline-none',
          fieldTextSize,
        )}
      />
    </div>
  )
}

const MESSAGES: Record<SlugAvailability['status'], string> = {
  idle: 'Lowercase letters, numbers and hyphens.',
  checking: 'Checking availability…',
  available: 'Available',
  taken: 'Already taken — try another.',
  current: 'This is your current link.',
  invalid: '',
  error: 'Couldn’t check availability. Check your connection.',
}

export function SlugStatusMessage({
  id,
  availability,
}: {
  id: string
  availability: SlugAvailability
}) {
  const { status } = availability
  const message = availability.status === 'invalid' ? availability.message : MESSAGES[status]

  return (
    <p
      id={id}
      aria-live="polite"
      className={clsx(
        'mt-1.5 flex items-center gap-1.5 text-[0.8125rem]',
        status === 'available' && 'font-medium text-success',
        (status === 'taken' || status === 'invalid') && 'font-medium text-danger',
        (status === 'idle' ||
          status === 'checking' ||
          status === 'current' ||
          status === 'error') &&
          'text-muted',
      )}
    >
      {status === 'checking' && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
      {status === 'available' && <Check aria-hidden className="size-3.5" />}
      {(status === 'taken' || status === 'invalid') && <CircleX aria-hidden className="size-3.5" />}
      {status === 'error' && <CircleAlert aria-hidden className="size-3.5" />}
      {message}
    </p>
  )
}
