import { clsx } from 'clsx'
import { Globe, type LucideIcon } from 'lucide-react'
import { useMemo, type CSSProperties, type Ref } from 'react'
import { getAffiliation, getContactItems, getVisibleLinks } from '@/components/card/card-content'
import { CardCover } from '@/components/card/CardParts'
import { getCardStyle } from '@/components/card/card-style'
import { QrCodeView } from '@/components/qr/QrCodeView'
import type { Card } from '@/types/card'
import { getLinkDisplayValue } from '@/utils/links'
import { buildQrOptions } from '@/utils/qr'

/*
 * A standard 3.5 × 2 in business card, sized in real inches so it prints at exactly that
 * size (and exports at 1050 × 600 px for 300 DPI). Text sizes are in px: 1px = 0.75pt.
 */

const SIZE = 'h-[2in] w-[3.5in] shrink-0'

interface FaceProps {
  card: Card
  url: string
  ref?: Ref<HTMLDivElement>
  className?: string
}

/** Front: identity and contact details, with the card's styled QR code. */
export function BusinessCardFront({ card, url, ref, className }: FaceProps) {
  const { profile, logo, theme } = card
  const affiliation = getAffiliation(profile)
  const qrOptions = useMemo(
    () => buildQrOptions(card.qr, { data: url, logo, size: 600 }),
    [card.qr, logo, url],
  )

  // Up to four short lines: phones, email, a single-line address, the first website.
  const lines: { icon: LucideIcon; value: string }[] = getContactItems(profile, false)
    .map((item) => ({ icon: item.icon, value: item.value.replace(/\s*\n\s*/g, ', ') }))
    .slice(0, 3)
  const website = getVisibleLinks(card.links).find(
    (link) => link.type === 'website' || link.type === 'custom',
  )
  if (website && lines.length < 4) {
    lines.push({ icon: Globe, value: getLinkDisplayValue(website.type, website.url) })
  }

  return (
    <div
      ref={ref}
      style={getCardStyle(theme)}
      className={clsx(SIZE, 'flex overflow-hidden bg-(--card-bg) text-(--card-fg)', className)}
    >
      <div aria-hidden className="w-[0.06in] shrink-0 bg-(--card-accent)" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-[0.17in] pr-[0.08in] pl-[0.17in]">
        <div className="min-w-0">
          {logo && (
            <img
              src={logo}
              alt=""
              className="mb-[0.07in] h-[0.22in] w-auto max-w-[1.3in] object-contain object-left"
            />
          )}
          <p className="truncate [font-family:var(--card-font-heading)] text-[16px] leading-tight font-semibold tracking-tight">
            {profile.fullName || 'Your name'}
          </p>
          {profile.jobTitle && (
            <p className="mt-[3px] truncate text-[7px] font-semibold tracking-[0.16em] text-(--card-accent-text) uppercase">
              {profile.jobTitle}
            </p>
          )}
          {affiliation && (
            <p className="mt-[2px] truncate text-[8.5px] text-(--card-muted)">{affiliation}</p>
          )}
        </div>
        <ul className="space-y-[3px] text-[8px] leading-tight">
          {lines.map(({ icon: Icon, value }) => (
            <li key={value} className="flex min-w-0 items-center gap-[5px]">
              <Icon aria-hidden className="size-[9px] shrink-0 text-(--card-accent-text)" />
              <span className="truncate">{value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex w-[1.22in] shrink-0 flex-col items-center justify-center gap-[3px] pr-[0.12in]">
        <div className="w-[1.04in] overflow-hidden rounded-[6px]">
          <QrCodeView options={qrOptions} />
        </div>
        <p className="text-[6px] font-semibold tracking-[0.14em] text-(--card-muted) uppercase">
          Scan to connect
        </p>
      </div>
    </div>
  )
}

/** Back: the cover (color or image) with the logo, or the company name, and the card link. */
export function BusinessCardBack({ card, url, ref, className }: FaceProps) {
  const { profile, logo, theme, cover } = card
  const shortUrl = url.replace(/^https?:\/\//, '')
  const imageCover = theme.coverType === 'image' && cover !== null

  return (
    <div ref={ref} style={getCardStyle(theme)} className={clsx(SIZE, className)}>
      <CardCover
        theme={theme}
        cover={cover}
        className="grid size-full place-items-center text-(--card-on-cover)"
        style={imageCover ? ({ '--card-on-cover': '#ffffff' } as CSSProperties) : undefined}
      >
        {imageCover && <div aria-hidden className="absolute inset-0 bg-black/35" />}
        <div className="relative flex flex-col items-center gap-[0.12in] px-[0.25in] text-center">
          {logo ? (
            <div className="rounded-[8px] bg-white/95 px-[0.14in] py-[0.1in] shadow-sm">
              <img src={logo} alt="" className="h-[0.42in] w-auto max-w-[2in] object-contain" />
            </div>
          ) : (
            <p className="[font-family:var(--card-font-heading)] text-[20px] leading-tight font-semibold tracking-tight">
              {profile.company || profile.fullName || 'Your company'}
            </p>
          )}
          <p className="text-[7px] font-medium tracking-[0.16em] uppercase opacity-85">
            {shortUrl}
          </p>
        </div>
      </CardCover>
    </div>
  )
}
