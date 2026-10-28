import { clsx } from 'clsx'
import type { LinkType } from '@/utils/links'
import { PLATFORM_STYLES } from './platform-icons'

/** Brand icon on a brand-colored rounded square. Decorative — pair it with a text label. */
export function PlatformBadge({ type, className }: { type: LinkType; className?: string }) {
  const { icon: Icon, color, iconColor = '#ffffff' } = PLATFORM_STYLES[type]
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color, color: iconColor }}
      className={clsx('grid shrink-0 place-items-center rounded-xl', className)}
    >
      <Icon className="size-[52%]" />
    </span>
  )
}
