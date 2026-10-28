import { clsx } from 'clsx'
import { useId, type ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group. */
  label: string
  /** Show the label above the control instead of only to screen readers. */
  showLabel?: boolean
  value: T
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  className?: string
}

/** A pill-shaped radio group. Native radios give arrow-key navigation for free. */
export function SegmentedControl<T extends string>({
  label,
  showLabel = false,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <fieldset className={className}>
      <legend className={showLabel ? 'mb-1.5 text-sm font-medium text-ink' : 'sr-only'}>
        {label}
      </legend>
      <div className="inline-flex max-w-full rounded-full bg-ink/[0.06] p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(
              'relative flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted transition-[background-color,color,box-shadow] duration-150',
              'hover:text-ink has-checked:bg-surface has-checked:text-ink has-checked:shadow-xs',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-ink',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => {
                onChange(option.value)
              }}
              className="sr-only"
            />
            {option.icon}
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
