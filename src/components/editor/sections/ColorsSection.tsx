import { clsx } from 'clsx'
import { Image as ImageIcon, Info, Palette } from 'lucide-react'
import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { isAccentAdjusted } from '@/components/card/card-style'
import { ColorField } from '@/components/ui/ColorField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ACCENT_COLOR_PRESETS, COVER_COLOR_PRESETS, PALETTE_PRESETS } from '@/config/palettes'
import type { CardContent } from '@/types/card'
import { FormSection } from '../FormSection'
import { ImageField } from '../ImageField'

const COVER_TYPES = [
  { value: 'color', label: 'Color', icon: <Palette aria-hidden className="size-3.5" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon aria-hidden className="size-3.5" /> },
] as const

export function ColorsSection() {
  const { control, setValue } = useFormContext<CardContent>()
  const [theme, cover] = useWatch({ control, name: ['theme', 'cover'] })
  const set = { shouldDirty: true }

  return (
    <FormSection title="Colors & cover" description="Start from a palette, then fine-tune.">
      <PalettePicker
        accent={theme.accent}
        cover={theme.coverColor}
        onChange={(palette) => {
          setValue('theme.accent', palette.accent, set)
          setValue('theme.coverColor', palette.cover, set)
        }}
      />

      <div>
        <ColorField
          label="Accent color"
          value={theme.accent}
          presets={ACCENT_COLOR_PRESETS}
          onChange={(value) => {
            setValue('theme.accent', value, set)
          }}
        />
        {isAccentAdjusted(theme) && (
          <p className="mt-2.5 flex gap-1.5 text-[0.8125rem] leading-relaxed text-muted">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            On a {theme.mode} card, this color is shown a little{' '}
            {theme.mode === 'dark' ? 'lighter' : 'darker'} so text and buttons stay easy to read.
          </p>
        )}
      </div>

      <div className="space-y-5 border-t border-line pt-5">
        <SegmentedControl
          label="Cover"
          showLabel
          value={theme.coverType}
          options={COVER_TYPES}
          onChange={(value) => {
            setValue('theme.coverType', value, set)
          }}
        />
        {theme.coverType === 'color' ? (
          <ColorField
            label="Cover color"
            value={theme.coverColor}
            presets={COVER_COLOR_PRESETS}
            onChange={(value) => {
              setValue('theme.coverColor', value, set)
            }}
          />
        ) : (
          <>
            <ImageField
              kind="cover"
              label="Cover image"
              hint="Landscape photos or textures work best. Saved at up to 1200 × 400."
              value={cover}
              onChange={(value) => {
                setValue('cover', value, set)
              }}
            />
            {!cover && (
              <p className="text-[0.8125rem] text-muted">
                Until you upload an image, your card uses the cover color.
              </p>
            )}
          </>
        )}
      </div>
    </FormSection>
  )
}

function PalettePicker({
  accent,
  cover,
  onChange,
}: {
  accent: string
  cover: string
  onChange: (palette: { accent: string; cover: string }) => void
}) {
  const name = useId()

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium">Palettes</legend>
      <div className="flex flex-wrap gap-2">
        {PALETTE_PRESETS.map((palette) => {
          const selected = palette.accent === accent && palette.cover === cover
          return (
            <label
              key={palette.name}
              className={clsx(
                'relative flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-sm font-medium transition-colors',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
                selected
                  ? 'border-ink bg-surface ring-1 ring-ink'
                  : 'border-line-strong bg-surface hover:border-ink/30',
              )}
            >
              <input
                type="radio"
                name={name}
                checked={selected}
                onChange={() => {
                  onChange(palette)
                }}
                className="sr-only"
              />
              <span
                aria-hidden
                className="size-7 rounded-full ring-1 ring-black/10 ring-inset"
                style={{
                  background: `linear-gradient(135deg, ${palette.cover} 0 50%, ${palette.accent} 50% 100%)`,
                }}
              />
              {palette.name}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
