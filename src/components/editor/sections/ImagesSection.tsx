import { Circle, Square } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { CardContent, PhotoShape } from '@/types/card'
import { FormSection } from '../FormSection'
import { ImageField } from '../ImageField'

const SHAPES = [
  { value: 'circle', label: 'Circle', icon: <Circle aria-hidden className="size-3.5" /> },
  { value: 'rounded', label: 'Rounded', icon: <Square aria-hidden className="size-3.5" /> },
] as const satisfies readonly { value: PhotoShape; label: string; icon: ReactNode }[]

export function ImagesSection() {
  const { control, setValue } = useFormContext<CardContent>()
  const [photo, logo, photoShape] = useWatch({
    control,
    name: ['photo', 'logo', 'theme.photoShape'],
  })

  return (
    <FormSection
      title="Photo & logo"
      description="Images are cropped and compressed in your browser before saving."
    >
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-5">
        <div className="space-y-4">
          <ImageField
            kind="photo"
            label="Profile photo"
            hint="JPG, PNG or WebP. Saved at 400 × 400."
            value={photo}
            photoShape={photoShape}
            onChange={(value) => {
              setValue('photo', value, { shouldDirty: true })
            }}
          />
          <SegmentedControl
            label="Photo shape"
            value={photoShape}
            options={SHAPES}
            onChange={(value) => {
              setValue('theme.photoShape', value, { shouldDirty: true })
            }}
          />
        </div>
        <ImageField
          kind="logo"
          label="Company logo"
          hint="A transparent PNG looks best. Saved up to 300 px wide."
          value={logo}
          onChange={(value) => {
            setValue('logo', value, { shouldDirty: true })
          }}
        />
      </div>
    </FormSection>
  )
}
