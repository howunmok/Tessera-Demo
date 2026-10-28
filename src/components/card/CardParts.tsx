import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import type { CardTheme, PhotoShape } from '@/types/card'
import { getInitials } from '@/utils/text'
import type { ContactItem } from './card-content'

/** Shared building blocks for card templates. */

/** The banner: the cover image when one is chosen and uploaded, otherwise the cover color. */
export function CardCover({
  theme,
  cover,
  className,
  style,
  sheen = true,
  children,
}: {
  theme: CardTheme
  cover: string | null
  className?: string
  /** Replaces the flat cover color, e.g. with a gradient. */
  style?: CSSProperties
  sheen?: boolean
  children?: ReactNode
}) {
  const showImage = theme.coverType === 'image' && cover !== null

  return (
    <div className={clsx('relative overflow-hidden bg-(--card-cover)', className)} style={style}>
      {showImage && <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />}
      {!showImage && sheen && (
        // A soft sheen gives flat colors some depth.
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(135deg,rgb(255_255_255/0.2),transparent_55%),radial-gradient(circle_at_85%_120%,rgb(0_0_0/0.22),transparent_60%)]"
        />
      )}
      {children}
    </div>
  )
}

/** The company logo on a frosted white tile, so it reads on any cover. */
export function CardLogo({
  logo,
  company,
  className,
}: {
  logo: string
  company: string
  className?: string
}) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white/90 px-2.5 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-sm',
        className,
      )}
    >
      <img
        src={logo}
        alt={company ? `${company} logo` : 'Company logo'}
        className="h-7 w-auto max-w-32 object-contain"
      />
    </div>
  )
}

export function CardAvatar({
  photo,
  name,
  shape,
  className,
}: {
  photo: string | null
  name: string
  shape: PhotoShape
  className?: string
}) {
  const rounding = shape === 'circle' ? 'rounded-full' : 'rounded-[28%]'

  if (photo) {
    return (
      <img
        src={photo}
        alt={name ? `Photo of ${name}` : 'Profile photo'}
        className={clsx('relative object-cover', rounding, className)}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={clsx(
        'relative grid place-items-center bg-(--card-accent) font-semibold text-(--card-on-accent)',
        rounding,
        className,
      )}
    >
      <span className="text-[1.75em]">{getInitials(name) || '?'}</span>
    </div>
  )
}

/**
 * A link (href), a button (onClick), or — in the editor preview, where nothing is
 * clickable — a plain element.
 */
function Actionable({
  href,
  onClick,
  external,
  className,
  hoverClassName = 'transition-colors hover:bg-(--card-tint)',
  children,
}: {
  href?: string
  onClick?: () => void
  external?: boolean
  className: string
  hoverClassName?: string
  children: ReactNode
}) {
  if (href) {
    return (
      <a
        href={href}
        className={clsx(className, hoverClassName)}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={clsx(className, hoverClassName)}>
        {children}
      </button>
    )
  }
  return <div className={className}>{children}</div>
}

/** A contact detail row with a tinted round icon. */
export function ContactRow({ item, className }: { item: ContactItem; className?: string }) {
  const Icon = item.icon
  return (
    <Actionable
      href={item.href}
      external={item.external}
      className={clsx('flex items-center gap-3.5', className)}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--card-tint) text-(--card-accent-text)">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-xs text-(--card-muted)">{item.label}</span>
        <span className="block text-[0.9375rem] font-medium break-words whitespace-pre-line">
          {item.value}
        </span>
      </span>
    </Actionable>
  )
}

/** A square quick-action tile (Call, Email, Save contact). */
export function ActionTile({
  icon: Icon,
  label,
  href,
  onClick,
  className,
}: {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <Actionable
      href={href}
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-1.5 rounded-2xl border border-(--card-line) px-2 py-3 text-center text-xs leading-tight font-medium',
        className,
      )}
    >
      <Icon aria-hidden className="size-5 text-(--card-accent-text)" />
      {label}
    </Actionable>
  )
}

/** A full-width button: solid accent, outlined, or soft tinted. */
export function CardButton({
  icon: Icon,
  label,
  href,
  onClick,
  variant,
  className,
}: {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  variant: 'solid' | 'outline' | 'soft'
  className?: string
}) {
  const styles = {
    solid: 'bg-(--card-accent) text-(--card-on-accent) shadow-sm',
    outline: 'border border-(--card-line-strong) text-(--card-fg)',
    soft: 'bg-(--card-tint) text-(--card-accent-text)',
  }
  return (
    <Actionable
      href={href}
      onClick={onClick}
      hoverClassName="transition-[filter] hover:brightness-110"
      className={clsx(
        'flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold',
        styles[variant],
        className,
      )}
    >
      <Icon aria-hidden className="size-4.5" />
      {label}
    </Actionable>
  )
}
