import { Copy, ExternalLink, Trash } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { CardAvatar, CardCover } from '@/components/card/CardParts'
import { getCardStyle } from '@/components/card/card-style'
import { getPublicCardUrl } from '@/config/app'
import type { Card } from '@/types/card'
import { copyText } from '@/utils/clipboard'
import { formatRelativeTime } from '@/utils/time'

export function CardTile({ card, onDelete }: { card: Card; onDelete: () => void }) {
  const name = card.profile.fullName || 'Untitled card'
  const role = [card.profile.jobTitle, card.profile.company].filter(Boolean).join(' · ')

  async function copyLink() {
    try {
      await copyText(getPublicCardUrl(card.slug))
      toast.success('Link copied')
    } catch {
      toast.error('Couldn’t copy the link')
    }
  }

  return (
    <li style={getCardStyle(card.theme)} className="group relative">
      <Link
        to={`/dashboard/cards/${card.id}`}
        aria-label={`Edit ${card.label || name}`}
        className="block overflow-hidden rounded-card border border-line bg-surface shadow-xs transition-[box-shadow,translate] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-card"
      >
        <CardCover theme={card.theme} cover={card.cover} className="h-20" />
        <div className="px-5 pb-5">
          <CardAvatar
            photo={card.photo}
            name={card.profile.fullName}
            shape={card.theme.photoShape}
            className="-mt-8 size-16 text-[0.6rem] ring-4 ring-surface"
          />
          <p className="mt-3 truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-muted">{role || 'No title yet'}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted">
            <span className="truncate font-medium">/c/{card.slug}</span>
            <span className="shrink-0">Edited {formatRelativeTime(card.updatedAt)}</span>
          </div>
        </div>
      </Link>

      {card.label && (
        <span className="pointer-events-none absolute top-3 left-3 max-w-[50%] truncate rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
          {card.label}
        </span>
      )}

      <div className="absolute top-3 right-3 flex gap-1.5">
        <TileAction icon={Copy} label="Copy public link" onClick={() => void copyLink()} />
        <Link
          to={`/c/${card.slug}`}
          target="_blank"
          rel="noopener"
          aria-label="Open public card (opens in a new tab)"
          title="Open public card"
          className={tileActionClass}
        >
          <ExternalLink aria-hidden className="size-4" />
        </Link>
        <TileAction icon={Trash} label="Delete card" onClick={onDelete} />
      </div>
    </li>
  )
}

const tileActionClass =
  'grid size-8 place-items-center rounded-full bg-white/90 text-ink shadow-xs transition-colors hover:bg-white'

function TileAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={tileActionClass}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  )
}
