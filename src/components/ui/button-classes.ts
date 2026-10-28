import { clsx } from 'clsx'

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-soft ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white shadow-soft hover:bg-ink-soft focus-visible:outline-ink',
  secondary:
    'border border-line-strong bg-surface text-ink shadow-xs hover:border-ink/25 hover:bg-canvas focus-visible:outline-ink',
  ghost: 'text-ink hover:bg-ink/5 focus-visible:outline-ink',
  danger: 'bg-danger text-white shadow-soft hover:bg-danger/90 focus-visible:outline-danger',
  'danger-ghost': 'text-danger hover:bg-danger-soft focus-visible:outline-danger',
  /** For dark backgrounds. */
  inverse: 'bg-white text-ink shadow-soft hover:bg-white/90 focus-visible:outline-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
}

export function buttonClasses(options: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}): string {
  return clsx(
    base,
    variants[options.variant ?? 'primary'],
    sizes[options.size ?? 'md'],
    options.className,
  )
}
