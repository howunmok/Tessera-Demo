import { clsx } from 'clsx'
import { useId, type ComponentPropsWithRef } from 'react'
import { fieldClasses } from './field-classes'

interface TextAreaFieldProps extends ComponentPropsWithRef<'textarea'> {
  label: string
  hint?: string
  error?: string
  /** Shows "count / max" under the field. */
  count?: { value: number; max: number }
}

export function TextAreaField({
  label,
  hint,
  error,
  count,
  id,
  className,
  rows = 3,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint && !error ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const overLimit = count !== undefined && count.value > count.max

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={clsx(hintId, errorId) || undefined}
        className={fieldClasses(Boolean(error), 'resize-y py-2.5 leading-relaxed')}
        {...props}
      />
      <div className="mt-1.5 flex items-start justify-between gap-3 text-[0.8125rem]">
        <div>
          {hintId && (
            <p id={hintId} className="text-muted">
              {hint}
            </p>
          )}
          {error && (
            <p id={errorId} className="font-medium text-danger">
              {error}
            </p>
          )}
        </div>
        {count && (
          <p
            aria-hidden
            className={clsx('shrink-0 tabular-nums', overLimit ? 'text-danger' : 'text-muted')}
          >
            {count.value}/{count.max}
          </p>
        )}
      </div>
    </div>
  )
}
