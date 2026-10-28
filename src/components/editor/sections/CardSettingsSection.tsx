import { TriangleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { getPublicCardUrl } from '@/config/app'
import { useSlugAvailability } from '@/hooks/useSlugAvailability'
import { changeCardSlug, getFirestoreErrorMessage } from '@/lib/firebase/cards'
import type { Card, CardContent } from '@/types/card'
import { FormSection } from '../FormSection'
import { SlugInput, SlugStatusMessage } from '../SlugInput'

interface CardSettingsSectionProps {
  card: Pick<Card, 'id' | 'ownerUid' | 'slug'>
  onSlugChanged: (slug: string) => void
}

export function CardSettingsSection({ card, onSlugChanged }: CardSettingsSectionProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CardContent>()

  return (
    <FormSection title="Card settings">
      <TextField
        label="Card name"
        placeholder="e.g. Work, Side business"
        hint="Only you see this — it helps you tell your cards apart."
        error={errors.label?.message}
        {...register('label')}
      />
      <SlugField card={card} onSlugChanged={onSlugChanged} />
    </FormSection>
  )
}

/** Changing the slug is explicit (not autosaved) because it breaks already-shared links. */
function SlugField({ card, onSlugChanged }: CardSettingsSectionProps) {
  const inputId = useId()
  const statusId = useId()
  const [value, setValue] = useState(card.slug)
  const [saving, setSaving] = useState(false)
  const availability = useSlugAvailability(value, card.slug)
  const changed = value !== card.slug

  async function save() {
    setSaving(true)
    try {
      await changeCardSlug(card, value)
      onSlugChanged(value)
      toast.success('Link updated', { description: getPublicCardUrl(value) })
    } catch (error) {
      toast.error('Couldn’t update the link', { description: getFirestoreErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        Public link
      </label>
      <SlugInput
        id={inputId}
        value={value}
        onChange={setValue}
        availability={availability}
        describedBy={statusId}
      />
      <SlugStatusMessage id={statusId} availability={availability} />

      {changed && (
        <div className="mt-4 rounded-xl border border-brass/40 bg-brass-soft/60 p-4">
          <p className="flex gap-2.5 text-sm leading-relaxed text-ink">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-brass-strong" />
            <span>
              Your current link <strong className="font-semibold">/c/{card.slug}</strong> will stop
              working, including QR codes you’ve already printed or shared.
            </span>
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2 pl-6.5">
            <Button
              size="sm"
              onClick={() => void save()}
              loading={saving}
              disabled={availability.status !== 'available'}
            >
              Save new link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setValue(card.slug)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
