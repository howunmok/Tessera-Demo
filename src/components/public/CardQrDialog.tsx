import { useMemo } from 'react'
import { QrCodeView } from '@/components/qr/QrCodeView'
import { Dialog } from '@/components/ui/Dialog'
import type { Card } from '@/types/card'
import { buildQrOptions } from '@/utils/qr'

/**
 * The card's own styled QR code, for showing your phone to someone in person.
 * Lazy-loaded, so the QR library is only downloaded when a visitor opens it.
 */
export default function CardQrDialog({
  card,
  url,
  onClose,
}: {
  card: Card
  url: string
  onClose: () => void
}) {
  const options = useMemo(
    () => buildQrOptions(card.qr, { data: url, logo: card.logo, size: 600 }),
    [card.qr, card.logo, url],
  )

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title="Scan to open this card"
      description="Point a phone’s camera at the code."
    >
      <div className="mx-auto max-w-[16rem] overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5">
        <QrCodeView options={options} label={`QR code that opens ${url}`} />
      </div>
      <p className="mt-4 truncate text-center text-xs text-muted" title={url}>
        {url}
      </p>
    </Dialog>
  )
}
