import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { SlugInput, SlugStatusMessage } from '@/components/editor/SlugInput'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormAlert } from '@/components/ui/FormAlert'
import { TextField } from '@/components/ui/TextField'
import { useSlugAvailability } from '@/hooks/useSlugAvailability'
import { createCard, getFirestoreErrorMessage } from '@/lib/firebase/cards'
import { LIMITS } from '@/schemas/card'
import { slugify } from '@/utils/slug'

interface CreateCardDialogProps {
  ownerUid: string
  defaultName: string
  email: string
  onClose: () => void
}

/** Mount it when opening so every new card starts with a fresh form. */
export function CreateCardDialog({ ownerUid, defaultName, email, onClose }: CreateCardDialogProps) {
  const navigate = useNavigate()
  const formId = useId()
  const slugInputId = useId()
  const slugStatusId = useId()
  const [fullName, setFullName] = useState(defaultName)
  const [label, setLabel] = useState('')
  const [slug, setSlug] = useState(slugify(defaultName))
  const [slugEdited, setSlugEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const availability = useSlugAvailability(slug)

  async function handleSubmit() {
    if (availability.status !== 'available') return
    setSubmitting(true)
    setError(null)
    try {
      const cardId = await createCard({
        ownerUid,
        slug,
        label: label.trim(),
        fullName: fullName.trim(),
        email,
      })
      toast.success('Card created')
      await navigate(`/dashboard/cards/${cardId}`)
    } catch (createError) {
      setError(getFirestoreErrorMessage(createError))
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={submitting}
      title="Create a new card"
      description="You can change everything later in the editor."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={submitting}
            disabled={availability.status !== 'available'}
          >
            Create card
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        {error && <FormAlert>{error}</FormAlert>}
        <TextField
          label="Full name"
          autoComplete="name"
          value={fullName}
          maxLength={LIMITS.name}
          onChange={(event) => {
            setFullName(event.target.value)
            if (!slugEdited) setSlug(slugify(event.target.value))
          }}
        />
        <TextField
          label="Card name (optional)"
          placeholder="e.g. Work, Side business"
          hint="Only you see this."
          value={label}
          maxLength={LIMITS.label}
          onChange={(event) => {
            setLabel(event.target.value)
          }}
        />
        <div>
          <label htmlFor={slugInputId} className="mb-1.5 block text-sm font-medium">
            Public link
          </label>
          <SlugInput
            id={slugInputId}
            value={slug}
            onChange={(value) => {
              setSlug(value)
              setSlugEdited(true)
            }}
            availability={availability}
            describedBy={slugStatusId}
          />
          <SlugStatusMessage id={slugStatusId} availability={availability} />
        </div>
      </form>
    </Dialog>
  )
}
