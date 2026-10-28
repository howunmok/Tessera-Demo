import { clsx } from 'clsx'
import { Check, Plus } from 'lucide-react'
import { useId, useState } from 'react'
import type { ColorPreset } from '@/config/palettes'
import { isLightColor } from '@/utils/color'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  presets: readonly ColorPreset[]
}

const swatchRing = 'ring-2 ring-ink ring-offset-2 ring-offset-surface'

/** Preset swatches, a custom color picker and a hex input. */
export function ColorField({ label, value, onChange, presets }: ColorFieldProps) {
  const name = useId()
  const hexId = useId()
  const current = value.toLowerCase()
  const isPreset = presets.some((preset) => preset.value.toLowerCase() === current)

  // The hex box keeps the user's partial typing until it forms a full color.
  const [draft, setDraft] = useState({ source: value, text: value.slice(1) })
  const hexText = draft.source === value ? draft.text : value.slice(1)

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {presets.map((preset) => {
          const selected = preset.value.toLowerCase() === current
          return (
            <label
              key={preset.value}
              title={preset.name}
              className="relative cursor-pointer rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ink"
            >
              <input
                type="radio"
                name={name}
                value={preset.value}
                checked={selected}
                onChange={() => {
                  onChange(preset.value)
                }}
                className="sr-only"
              />
              <span className="sr-only">{preset.name}</span>
              <span
                aria-hidden
                style={{ backgroundColor: preset.value }}
                className={clsx(
                  'grid size-9 place-items-center rounded-full shadow-xs ring-1 ring-black/10 transition-transform ring-inset hover:scale-105',
                  selected && swatchRing,
                )}
              >
                {selected && (
                  <Check
                    strokeWidth={3}
                    className={clsx(
                      'size-4',
                      isLightColor(preset.value) ? 'text-ink' : 'text-white',
                    )}
                  />
                )}
              </span>
            </label>
          )
        })}

        <label
          title="Custom color"
          className="relative cursor-pointer rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ink"
        >
          <input
            type="color"
            value={value}
            onChange={(event) => {
              onChange(event.target.value.toLowerCase())
            }}
            aria-label="Pick a custom color"
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden
            style={{
              background: isPreset
                ? 'conic-gradient(#f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)'
                : value,
            }}
            className={clsx(
              'grid size-9 place-items-center rounded-full shadow-xs ring-1 ring-black/10 ring-inset',
              !isPreset && swatchRing,
            )}
          >
            {isPreset ? (
              <Plus strokeWidth={3} className="size-4 text-white drop-shadow" />
            ) : (
              <Check
                strokeWidth={3}
                className={clsx('size-4', isLightColor(value) ? 'text-ink' : 'text-white')}
              />
            )}
          </span>
        </label>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5">
        <label htmlFor={hexId} className="text-sm text-muted">
          Hex
        </label>
        <div className="flex h-9 w-32 items-center rounded-lg border border-line-strong bg-surface px-2.5 shadow-xs focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10">
          {/* 16px on touch screens, so iOS doesn't zoom in on focus. */}
          <span aria-hidden className="font-mono text-sm text-muted pointer-coarse:text-base">
            #
          </span>
          <input
            id={hexId}
            value={hexText}
            maxLength={6}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              const text = event.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 6)
              setDraft({ source: value, text })
              if (text.length === 6) onChange(`#${text.toLowerCase()}`)
            }}
            className="w-full bg-transparent pl-1 font-mono text-sm uppercase outline-none pointer-coarse:text-base"
          />
        </div>
      </div>
    </fieldset>
  )
}
