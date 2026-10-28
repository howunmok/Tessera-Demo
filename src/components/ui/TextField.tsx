import { clsx } from 'clsx'
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { fieldClasses } from './field-classes'

export interface TextFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  hint?: string
  error?: string
  /** Element rendered inside the right edge of the input, e.g. a show-password button. */
  trailing?: ReactNode
}

export function TextField({
  label,
  hint,
  error,
  trailing,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  // The error replaces the hint while it's showing.
  const hintId = hint && !error ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = clsx(hintId, errorId) || undefined

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClasses(Boolean(error), clsx('h-11', trailing !== undefined && 'pr-11'))}
          {...props}
        />
        {trailing !== undefined && (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
        )}
      </div>
      {hintId && (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
