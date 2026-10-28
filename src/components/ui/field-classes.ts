import { clsx } from 'clsx'

/**
 * Text size for anything you type into. Touch screens get 16px: iOS zooms in on any smaller
 * field when it's focused, and doesn't zoom back out afterwards.
 */
export const fieldTextSize = 'text-[0.9375rem] pointer-coarse:text-base'

/** Shared look for text inputs, textareas and selects. */
export function fieldClasses(hasError: boolean, className?: string): string {
  return clsx(
    'block w-full rounded-xl border bg-surface px-3.5 text-ink shadow-xs',
    fieldTextSize,
    'transition-[border-color,box-shadow] duration-150 placeholder:text-muted/60',
    'focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-line-strong hover:border-ink/30 focus:border-ink focus:ring-ink/10',
    className,
  )
}
