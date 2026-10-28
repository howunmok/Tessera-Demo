import { clsx } from 'clsx'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { BusinessCardBack, BusinessCardFront } from '@/components/print/BusinessCard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageLoader } from '@/components/ui/PageLoader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Switch } from '@/components/ui/Switch'
import { getPublicCardUrl } from '@/config/app'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getCard, getFirestoreErrorMessage } from '@/lib/firebase/cards'
import type { Card } from '@/types/card'
import { downloadElementAsPng, PRINT_PIXEL_RATIO } from '@/utils/export-image'

type Layout = 'single' | 'sheet'

const LAYOUTS = [
  { value: 'single', label: 'Single card' },
  { value: 'sheet', label: 'Sheet of 10' },
] as const

/** Avery 8371 / 5371 (US Letter): 2 × 5 cards, 0.75 in side and 0.5 in top margins. */
const SHEET_POSITIONS = Array.from({ length: 10 }, (_, index) => ({
  left: `${String(0.75 + (index % 2) * 3.5)}in`,
  top: `${String(0.5 + Math.floor(index / 2) * 2)}in`,
}))

export function PrintPage() {
  const { cardId = '' } = useParams()
  const user = useCurrentUser()
  const { state, reload } = useAsync(() => getCard(cardId), cardId)
  useDocumentTitle('Print & export')

  if (state.status === 'loading') return <PageLoader />
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <ErrorState message={getFirestoreErrorMessage(state.error)} onRetry={reload} />
      </div>
    )
  }
  if (state.data?.ownerUid !== user.uid) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">Card not found</h1>
        <ButtonLink to="/dashboard" variant="secondary" className="mt-8">
          <ArrowLeft aria-hidden className="size-4" /> Back to your cards
        </ButtonLink>
      </div>
    )
  }
  return <PrintStudio card={state.data} />
}

function PrintStudio({ card }: { card: Card }) {
  const url = getPublicCardUrl(card.slug)
  const [layout, setLayout] = useState<Layout>('single')
  const [cutLines, setCutLines] = useState(false)
  const [busy, setBusy] = useState<'front' | 'back' | null>(null)
  // Unscaled copies used for PNG export (the preview below is zoomed to fit the screen).
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  async function download(side: 'front' | 'back') {
    const element = side === 'front' ? frontRef.current : backRef.current
    if (!element) return
    setBusy(side)
    try {
      await downloadElementAsPng(
        element,
        `${card.slug}-business-card-${side}.png`,
        PRINT_PIXEL_RATIO,
      )
      toast.success(`Saved the ${side} as PNG`, { description: '1050 × 600 px · 300 DPI' })
    } catch {
      toast.error('Couldn’t create the image. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 print:m-0 print:max-w-none print:p-0">
      <div className="print:hidden">
        <Link
          to={`/dashboard/cards/${card.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4" /> Back to editor
        </Link>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight">Print & export</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted">
          A standard 3.5″ × 2″ business card with your QR code. Download each side as a 300 DPI PNG
          for a print shop or your email signature, or print it yourself.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-card border border-line bg-surface p-4 sm:p-5">
          <SegmentedControl label="Layout" value={layout} options={LAYOUTS} onChange={setLayout} />
          <label className="flex items-center gap-2.5 text-sm font-medium">
            <Switch checked={cutLines} onChange={setCutLines} label="Cut lines" />
            Cut lines
          </label>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'front'}
              disabled={busy !== null}
              onClick={() => void download('front')}
            >
              {busy !== 'front' && <Download aria-hidden className="size-4" />} Front PNG
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === 'back'}
              disabled={busy !== null}
              onClick={() => void download('back')}
            >
              {busy !== 'back' && <Download aria-hidden className="size-4" />} Back PNG
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.print()
              }}
            >
              <Printer aria-hidden className="size-4" /> Print
            </Button>
          </div>
        </div>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
          {layout === 'single'
            ? 'Front and back with crop marks — cut along the marks, or send the PNGs to a print shop.'
            : 'Ten fronts on US Letter, lined up for Avery 8371 / 5371 business-card sheets.'}{' '}
          In the print dialog, set scale to 100% (“Actual size”) and turn on “Background graphics”.
        </p>
      </div>

      {/* The printable page, shown smaller on screen. */}
      <div className="mt-8 overflow-x-auto pb-4 print:m-0 print:overflow-visible print:p-0">
        <div
          className={clsx(
            'relative mx-auto h-[11in] w-[8.5in] bg-white shadow-lift [-webkit-print-color-adjust:exact] [print-color-adjust:exact]',
            '[zoom:0.42] sm:[zoom:0.7] lg:[zoom:0.85] print:[zoom:1] print:shadow-none',
          )}
        >
          {layout === 'single' ? (
            <div className="flex h-full flex-col items-center justify-center gap-[1in]">
              <CropMarks>
                <BusinessCardFront
                  card={card}
                  url={url}
                  className={clsx(cutLines && 'outline outline-[0.5px] outline-black/25')}
                />
              </CropMarks>
              <CropMarks>
                <BusinessCardBack
                  card={card}
                  url={url}
                  className={clsx(cutLines && 'outline outline-[0.5px] outline-black/25')}
                />
              </CropMarks>
            </div>
          ) : (
            SHEET_POSITIONS.map((position, index) => (
              <div key={index} className="absolute" style={position}>
                <BusinessCardFront
                  card={card}
                  url={url}
                  className={clsx(cutLines && 'outline outline-[0.5px] outline-black/25')}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Off-screen, unscaled copies for PNG export. */}
      <div aria-hidden className="pointer-events-none fixed top-0 -left-[10000px] print:hidden">
        <BusinessCardFront ref={frontRef} card={card} url={url} />
        <BusinessCardBack ref={backRef} card={card} url={url} />
      </div>
    </div>
  )
}

/** Short corner lines just outside the card, showing where to cut. */
function CropMarks({ children }: { children: ReactNode }) {
  const mark = 'absolute bg-black'
  return (
    <div className="relative">
      {children}
      {(['top-0', 'bottom-0'] as const).map((y) =>
        (['left-0', 'right-0'] as const).map((x) => (
          <span key={`${y}-${x}`} aria-hidden className={clsx('absolute', y, x)}>
            <span
              className={clsx(
                mark,
                'h-[0.5px] w-[0.25in]',
                x === 'left-0' ? 'right-[0.08in]' : 'left-[0.08in]',
              )}
            />
            <span
              className={clsx(
                mark,
                'h-[0.25in] w-[0.5px]',
                y === 'top-0' ? 'bottom-[0.08in]' : 'top-[0.08in]',
              )}
            />
          </span>
        )),
      )}
    </div>
  )
}
