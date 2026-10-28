import { clsx } from 'clsx'
import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'

export interface Choice<T extends string> {
  value: T
  title: string
  description?: string
  /** Visual shown above the title, e.g. a template thumbnail. */
  visual?: ReactNode
}

interface ChoiceCardsProps<T extends string> {
  label: string
  value: T
  choices: readonly Choice<T>[]
  onChange: (value: T) => void
  className?: string
}

/** A radio group shown as selectable cards. Native radios give arrow-key navigation. */
export function ChoiceCards<T extends string>({
  label,
  value,
  choices,
  onChange,
  className,
}: ChoiceCardsProps<T>) {
  const name = useId()

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium">{label}</legend>
      <div className={clsx('grid gap-3', className)}>
        {choices.map((choice) => {
          const selected = choice.value === value
          return (
            <label
              key={choice.value}
              className={clsx(
                'relative cursor-pointer rounded-2xl border bg-surface p-2.5 transition-[border-color,box-shadow] duration-150',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
                selected
                  ? 'border-ink shadow-soft ring-1 ring-ink'
                  : 'border-line hover:border-ink/30',
              )}
            >
              <input
                type="radio"
                name={name}
                value={choice.value}
                checked={selected}
                onChange={() => {
                  onChange(choice.value)
                }}
                className="sr-only"
              />
              {choice.visual}
              <span className={clsx('block px-1 text-sm font-semibold', choice.visual && 'mt-2.5')}>
                {choice.title}
              </span>
              {choice.description && (
                <span className="block px-1 pb-0.5 text-xs leading-snug text-muted">
                  {choice.description}
                </span>
              )}
              {selected && (
                <span
                  aria-hidden
                  className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-ink text-white shadow-soft"
                >
                  <Check strokeWidth={3} className="size-3" />
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
