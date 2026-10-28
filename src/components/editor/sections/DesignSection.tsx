import { Moon, Sun } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ChoiceCards } from '@/components/ui/ChoiceCards'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { CARD_FONTS, TEMPLATES } from '@/config/card-design'
import { FONT_IDS, TEMPLATE_IDS } from '@/schemas/card'
import type { CardContent } from '@/types/card'
import { TemplateSketch } from '../design/TemplateSketch'
import { FormSection } from '../FormSection'

const MODES = [
  { value: 'light', label: 'Light', icon: <Sun aria-hidden className="size-3.5" /> },
  { value: 'dark', label: 'Dark', icon: <Moon aria-hidden className="size-3.5" /> },
] as const

export function DesignSection() {
  const { control, setValue } = useFormContext<CardContent>()
  const theme = useWatch({ control, name: 'theme' })

  return (
    <FormSection title="Design" description="Pick a layout, then make it yours.">
      <ChoiceCards
        label="Template"
        value={theme.template}
        className="grid-cols-1 sm:grid-cols-3"
        onChange={(template) => {
          setValue('theme.template', template, { shouldDirty: true })
        }}
        choices={TEMPLATE_IDS.map((id) => ({
          value: id,
          title: TEMPLATES[id].name,
          description: TEMPLATES[id].description,
          visual: <TemplateSketch theme={{ ...theme, template: id }} />,
        }))}
      />

      <SegmentedControl
        label="Appearance"
        showLabel
        value={theme.mode}
        options={MODES}
        onChange={(mode) => {
          setValue('theme.mode', mode, { shouldDirty: true })
        }}
      />

      <ChoiceCards
        label="Fonts"
        value={theme.font}
        className="grid-cols-3"
        onChange={(font) => {
          setValue('theme.font', font, { shouldDirty: true })
        }}
        choices={FONT_IDS.map((id) => ({
          value: id,
          title: CARD_FONTS[id].name,
          description: CARD_FONTS[id].sample,
          visual: (
            <span
              aria-hidden
              style={{ fontFamily: CARD_FONTS[id].heading }}
              className="grid h-16 place-items-center rounded-xl bg-canvas text-3xl font-semibold tracking-tight"
            >
              Aa
            </span>
          ),
        }))}
      />
    </FormSection>
  )
}
