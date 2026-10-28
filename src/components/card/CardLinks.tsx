import { clsx } from 'clsx'
import { ArrowUpRight, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { PlatformBadge } from '@/components/links/PlatformBadge'
import type { CardLink } from '@/types/card'
import { copyText } from '@/utils/clipboard'
import { getLinkDisplayValue, getLinkLabel, isWeChatId, safeLinkHref } from '@/utils/links'
import { getVisibleLinks } from './card-content'

/**
 * boxed:   bordered rows (Modern Minimal)
 * divided: hairline-separated rows, no boxes (Corporate Classic)
 * filled:  soft filled rows (Bold Gradient)
 */
export type CardLinksVariant = 'boxed' | 'divided' | 'filled'

const LIST_STYLES: Record<CardLinksVariant, string> = {
  boxed: 'space-y-2.5',
  divided: 'divide-y divide-(--card-line)',
  filled: 'space-y-2',
}

const ITEM_STYLES: Record<CardLinksVariant, string> = {
  boxed: 'rounded-2xl border border-(--card-line) p-2.5 pr-4',
  divided: 'py-3 pr-1',
  filled: 'rounded-2xl bg-(--card-surface) p-2.5 pr-4',
}

export function CardLinks({
  links,
  live,
  variant = 'boxed',
  className,
}: {
  links: CardLink[]
  live: boolean
  variant?: CardLinksVariant
  className?: string
}) {
  const items = getVisibleLinks(links)
  if (items.length === 0) return null

  return (
    <ul aria-label="Links" className={clsx(LIST_STYLES[variant], className)}>
      {items.map((link) => (
        <li key={link.id}>
          <CardLinkItem link={link} live={live} variant={variant} />
        </li>
      ))}
    </ul>
  )
}

function CardLinkItem({
  link,
  live,
  variant,
}: {
  link: CardLink
  live: boolean
  variant: CardLinksVariant
}) {
  const wechatId = isWeChatId(link.type, link.url)
  const href = safeLinkHref(link.type, link.url)
  const label = getLinkLabel(link)
  const className = clsx('flex w-full items-center gap-3.5 text-left', ITEM_STYLES[variant])
  const interactive =
    variant === 'divided'
      ? 'transition-opacity hover:opacity-75'
      : 'transition-colors hover:bg-(--card-tint)'

  const content = (
    <>
      <PlatformBadge
        type={link.type}
        className={clsx(
          // A hairline keeps black brand badges (X, GitHub…) visible on dark cards.
          'ring-1 ring-(--card-line)',
          variant === 'divided' ? 'size-9 rounded-lg' : 'size-10',
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium">{label}</span>
        <span className="block truncate text-xs text-(--card-muted)">
          {getLinkDisplayValue(link.type, link.url)}
        </span>
      </span>
      {wechatId ? (
        <Copy aria-hidden className="size-4 shrink-0 text-(--card-muted)" />
      ) : (
        <ArrowUpRight aria-hidden className="size-4 shrink-0 text-(--card-muted)" />
      )}
    </>
  )

  if (live && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(className, interactive)}
      >
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  }

  if (live && wechatId) {
    return (
      <button
        type="button"
        className={clsx(className, interactive)}
        aria-label={`Copy WeChat ID ${link.url}`}
        onClick={() => {
          copyText(link.url).then(
            () =>
              toast.success('WeChat ID copied', {
                description: 'Open WeChat → Add Contacts → paste it.',
              }),
            () => toast.error('Couldn’t copy the WeChat ID'),
          )
        }}
      >
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}
