import { useFormContext, useWatch } from 'react-hook-form'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { LIMITS } from '@/schemas/card'
import type { CardContent } from '@/types/card'
import { FormSection } from '../FormSection'

export function AboutSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CardContent>()
  const bio = useWatch({ control, name: 'profile.bio' })

  return (
    <FormSection title="About">
      <TextAreaField
        label="Short bio or tagline (optional)"
        placeholder="e.g. Helping families protect what matters most."
        rows={3}
        count={{ value: bio.length, max: LIMITS.bio }}
        error={errors.profile?.bio?.message}
        {...register('profile.bio')}
      />
    </FormSection>
  )
}
