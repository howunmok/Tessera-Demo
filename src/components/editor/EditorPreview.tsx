import { Check, Copy, Download, Printer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { CardRenderer } from '@/components/card/CardRenderer'
import type { CardRenderContent } from '@/components/card/templates/types'
import { Button, ButtonLink } from '@/components/ui/Button'
import { getPublicCardUrl } from '@/config/app'
import type { CardContent } from '@/types/card'
import { copyText } from '@/utils/clipboard'
import { downloadElementAsPng } from '@/utils/export-image'

/** Re-renders on every keystroke; only this subtree subscribes to all form values. */
export function EditorPreview({ slug, cardId }: { slug: string; cardId: string }) {
  const { control } = useFormContext<CardContent>()
  const [profile, photo, logo, cover, links, theme] = useWatch({
    control,
    name: ['profile', 'photo', 'logo', 'cover', 'links', 'theme'],
  })
  const content = { profile, photo, logo, cover, links, theme }
  const url = getPublicCardUrl(slug)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function copy() {
    try {
      await copyText(url)
      setCopied(true)
      toast.success('Link copied')
      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      toast.error('Couldn’t copy the link')
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Live preview</h2>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {copied ? (
            <Check aria-hidden className="size-4 shrink-0 text-success" />
          ) : (
            <Copy aria-hidden className="size-4 shrink-0" />
          )}
          <span className="truncate">Copy link</span>
        </button>
      </div>

      {/* On desktop the preview is sticky; a tall card scrolls inside it instead of
          disappearing below the window. */}
      <div className="[scrollbar-width:thin] rounded-[2rem] border border-line bg-dots p-4 sm:p-6 lg:max-h-[calc(100dvh-18.5rem)] lg:overflow-y-auto lg:overscroll-contain">
        <div className="mx-auto max-w-[25rem]">
          <CardRenderer content={content} mode="preview" />
        </div>
      </div>
      <p className="mt-3 truncate text-center text-xs text-muted" title={url}>
        {url}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          aria-label="Download image"
          loading={exporting}
          onClick={() => {
            setExporting(true)
          }}
        >
          {!exporting && <Download aria-hidden className="size-4" />}
          {/* Short labels on phones, where each button gets half the screen. */}
          <span className="sm:hidden">Download</span>
          <span className="max-sm:hidden">Download image</span>
        </Button>
        <ButtonLink
          to={`/dashboard/cards/${cardId}/print`}
          variant="secondary"
          size="sm"
          aria-label="Business card & print"
        >
          <Printer aria-hidden className="size-4" />
          <span className="sm:hidden">Print</span>
          <span className="max-sm:hidden">Business card & print</span>
        </ButtonLink>
      </div>

      {exporting && (
        <CardImageExport
          content={content}
          fileName={`${slug}-card.png`}
          onDone={() => {
            setExporting(false)
          }}
        />
      )}
    </div>
  )
}

/**
 * Renders the card off-screen at a fixed width (no shadow, transparent corners), saves it as
 * a high-resolution PNG, then unmounts.
 */
function CardImageExport({
  content,
  fileName,
  onDone,
}: {
  content: CardRenderContent
  fileName: string
  onDone: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Freeze what was asked for when the export started; later edits don't restart it.
  const [snapshot] = useState(content)
  const [name] = useState(fileName)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    let cancelled = false
    // Two frames: let layout and images settle before capturing.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = ref.current?.querySelector('article')
        if (!element || cancelled) return
        downloadElementAsPng(element, name, 3).then(
          () => {
            toast.success('Card saved as PNG')
            onDoneRef.current()
          },
          () => {
            toast.error('Couldn’t create the image. Please try again.')
            onDoneRef.current()
          },
        )
      })
    })
    return () => {
      cancelled = true
    }
  }, [name])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 -left-[10000px] w-[25rem] [&_article]:shadow-none"
    >
      <CardRenderer content={snapshot} mode="preview" />
    </div>
  )
}
