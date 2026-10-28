import { clsx } from 'clsx'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name, e.g. "Show LinkedIn on card". */
  label: string
  className?: string
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => {
        onChange(!checked)
      }}
      className={clsx(
        'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        checked ? 'bg-ink' : 'bg-line-strong',
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-soft',
          checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
