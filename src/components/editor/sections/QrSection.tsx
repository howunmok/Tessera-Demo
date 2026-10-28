import { RotateCcw } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { ColorField } from '@/components/ui/ColorField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Switch } from '@/components/ui/Switch'
import { DEFAULT_QR } from '@/config/card-defaults'
import {
  QR_BACKGROUND_PRESETS,
  QR_CODE_COLOR_PRESETS,
  QR_GRADIENT_PRESETS,
  withCardAccent,
} from '@/config/palettes'
import type { CardContent } from '@/types/card'
import { DotStylePicker } from '../qr/DotStylePicker'
import { FormSection } from '../FormSection'

const CORNER_FRAMES = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Circle' },
] as const

const CORNER_CENTERS = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
] as const

const set = { shouldDirty: true }

export function QrStyleSection() {
  const { control, setValue } = useFormContext<CardContent>()
  const [qr, logo] = useWatch({ control, name: ['qr', 'logo'] })

  return (
    <FormSection title="QR style" description="Shape your code to match your card.">
      <DotStylePicker
        qr={qr}
        onChange={(style) => {
          setValue('qr.dotStyle', style, set)
        }}
      />
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <SegmentedControl
          label="Corner frame"
          showLabel
          value={qr.cornerSquareStyle}
          options={CORNER_FRAMES}
          onChange={(value) => {
            setValue('qr.cornerSquareStyle', value, set)
          }}
        />
        <SegmentedControl
          label="Corner center"
          showLabel
          value={qr.cornerDotStyle}
          options={CORNER_CENTERS}
          onChange={(value) => {
            setValue('qr.cornerDotStyle', value, set)
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
        <div>
          <p className="text-sm font-medium">Logo in the center</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            {logo
              ? 'Uses your company logo. The code switches to high error correction (H), so it still scans with part of it covered.'
              : 'Add a company logo in the Details tab to use this.'}
          </p>
        </div>
        {logo ? (
          <Switch
            checked={qr.showLogo}
            onChange={(checked) => {
              setValue('qr.showLogo', checked, set)
            }}
            label="Logo in the center"
          />
        ) : (
          <span className="shrink-0 text-xs font-medium text-muted">No logo</span>
        )}
      </div>
    </FormSection>
  )
}

export function QrColorsSection() {
  const { control, setValue } = useFormContext<CardContent>()
  const [qr, accent] = useWatch({ control, name: ['qr', 'theme.accent'] })

  return (
    <FormSection
      title="QR colors"
      description="Dark codes on light backgrounds scan best. You’ll see a warning if contrast gets too low."
    >
      <ColorField
        label="Code color"
        value={qr.foreground}
        presets={withCardAccent(QR_CODE_COLOR_PRESETS, accent)}
        onChange={(value) => {
          setValue('qr.foreground', value, set)
        }}
      />
      <ColorField
        label="Background"
        value={qr.background}
        presets={QR_BACKGROUND_PRESETS}
        onChange={(value) => {
          setValue('qr.background', value, set)
        }}
      />

      <div className="space-y-5 rounded-2xl border border-line p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Gradient</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
              Blends the code color into a second color, diagonally.
            </p>
          </div>
          <Switch
            checked={qr.gradient}
            onChange={(checked) => {
              // Start from the card's accent, unless that's already the code color.
              if (checked && qr.gradientColor.toLowerCase() === qr.foreground.toLowerCase()) {
                const fallback =
                  accent.toLowerCase() === qr.foreground.toLowerCase() ? '#2343a8' : accent
                setValue('qr.gradientColor', fallback, set)
              }
              setValue('qr.gradient', checked, set)
            }}
            label="Gradient"
          />
        </div>
        {qr.gradient && (
          <ColorField
            label="Blend into"
            value={qr.gradientColor}
            presets={withCardAccent(QR_GRADIENT_PRESETS, accent)}
            onChange={(value) => {
              setValue('qr.gradientColor', value, set)
            }}
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => {
          setValue('qr', { ...DEFAULT_QR, gradientColor: accent }, set)
        }}
      >
        <RotateCcw aria-hidden className="size-4" /> Reset QR style
      </Button>
    </FormSection>
  )
}
