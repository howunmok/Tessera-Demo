import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { getPublicCardUrl } from '@/config/app'
import { deleteCard, getFirestoreErrorMessage } from '@/lib/firebase/cards'
import type { Card } from '@/types/card'

export function DeleteCardDialog({
  card,
  onClose,
  onDeleted,
}: {
  card: Card
  onClose: () => void
  onDeleted: (cardId: string) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const name = card.label || card.profile.fullName || 'this card'

  async function confirm() {
    setDeleting(true)
    try {
      await deleteCard(card)
      onDeleted(card.id)
      toast.success('Card deleted')
    } catch (error) {
      toast.error('Couldn’t delete the card', { description: getFirestoreErrorMessage(error) })
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={deleting}
      size="sm"
      title={`Delete “${name}”?`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void confirm()} loading={deleting}>
            Delete card
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        The link{' '}
        <span className="font-medium break-all text-ink">{getPublicCardUrl(card.slug)}</span> will
        stop working, including any QR codes you’ve printed or shared. This can’t be undone.
      </p>
    </Dialog>
  )
}
