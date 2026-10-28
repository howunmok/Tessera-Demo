import { clsx } from 'clsx'
import { CircleAlert, CircleCheck, Download, Info, Printer, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { downloadQrCode } from '@/components/qr/download-qr'
import { QrCodeView } from '@/components/qr/QrCodeView'
import { Button, ButtonLink } from '@/components/ui/Button'
import { getPublicCardUrl } from '@/config/app'
import type { CardContent } from '@/types/card'
import { buildQrOptions, getQrScanIssues } from '@/utils/qr'

const DOWNLOAD_SIZE = 1200

/** Large live QR preview with its scan check and downloads. */
export function QrPreviewPanel({ slug, cardId }: { slug: string; cardId: string }) {
  const { control } = useFormContext<CardContent>()
  const [qr, logo] = useWatch({ control, name: ['qr', 'logo'] })
  const url = getPublicCardUrl(slug)
  const options = useMemo(() => buildQrOptions(qr, { data: url, logo, size: 600 }), [qr, logo, url])
  const issues = getQrScanIssues(qr)
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null)

  async function download(format: 'png' | 'svg') {
    setDownloading(format)
    try {
      const fullSize = buildQrOptions(qr, { data: url, logo, size: DOWNLOAD_SIZE })
      await downloadQrCode(fullSize, format, `${slug}-qr`)
      toast.success(`QR code downloaded as ${format.toUpperCase()}`)
    } catch {
      toast.error('Couldn’t create the download. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">QR code</h2>
        <span className="text-xs text-muted">
          {qr.showLogo && logo ? 'Error correction: High (H)' : 'Error correction: Medium (M)'}
        </span>
      </div>

      <div className="rounded-[2rem] border border-line bg-dots p-6 sm:p-8">
        <div className="mx-auto max-w-[17rem] overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5">
          <QrCodeView options={options} label={`QR code that opens ${url}`} />
        </div>
      </div>
      <p className="mt-3 truncate text-center text-xs text-muted" title={url}>
        Opens {url}
      </p>

      <ScanStatus issues={issues} />

      {isLocal && (
        <p className="mt-3 flex gap-2 rounded-xl border border-line bg-surface p-3 text-[0.8125rem] leading-relaxed text-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            This is a local development address, so this code only works on this computer. Codes
            made on your deployed site use its address (or <code>VITE_PUBLIC_BASE_URL</code>).
          </span>
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Button
          onClick={() => void download('png')}
          loading={downloading === 'png'}
          disabled={downloading !== null}
        >
          {downloading !== 'png' && <Download aria-hidden className="size-4" />}
          PNG
        </Button>
        <Button
          variant="secondary"
          onClick={() => void download('svg')}
          loading={downloading === 'svg'}
          disabled={downloading !== null}
        >
          {downloading !== 'svg' && <Download aria-hidden className="size-4" />}
          SVG
        </Button>
      </div>
      <p className="mt-2.5 text-center text-xs leading-relaxed text-muted">
        PNG is {DOWNLOAD_SIZE} × {DOWNLOAD_SIZE} px. SVG stays sharp at any size — best for print.
        Keep printed codes at least 2 cm (¾ in) wide.
      </p>
      <ButtonLink
        to={`/dashboard/cards/${cardId}/print`}
        variant="ghost"
        size="sm"
        className="mx-auto mt-3 flex w-fit"
      >
        <Printer aria-hidden className="size-4" /> Put it on a business card
      </ButtonLink>
    </div>
  )
}

function ScanStatus({ issues }: { issues: ReturnType<typeof getQrScanIssues> }) {
  if (issues.length === 0) {
    return (
      <p
        role="status"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-success"
      >
        <CircleCheck aria-hidden className="size-4" /> Good contrast — scans reliably
      </p>
    )
  }

  return (
    <ul role="status" className="mt-4 space-y-2">
      {issues.map((issue) => {
        const Icon = issue.level === 'error' ? CircleAlert : TriangleAlert
        return (
          <li
            key={issue.message}
            className={clsx(
              'flex gap-2 rounded-xl border p-3 text-[0.8125rem] leading-relaxed',
              issue.level === 'error'
                ? 'border-danger/20 bg-danger-soft text-danger'
                : 'border-brass/40 bg-brass-soft/70 text-ink',
            )}
          >
            <Icon
              aria-hidden
              className={clsx(
                'mt-0.5 size-4 shrink-0',
                issue.level === 'warning' && 'text-brass-strong',
              )}
            />
            {issue.message}
          </li>
        )
      })}
    </ul>
  )
}
