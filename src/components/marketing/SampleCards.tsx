import { clsx } from 'clsx'
import { Globe, Mail, Phone } from 'lucide-react'

/*
 * Decorative business-card mock-ups for the landing and sign-in pages.
 */

const QR_SIZE = 21

function isFinderCell(x: number, y: number): boolean {
  const inBox = (left: number, top: number) => x >= left && x < left + 7 && y >= top && y < top + 7
  return inBox(0, 0) || inBox(QR_SIZE - 7, 0) || inBox(0, QR_SIZE - 7)
}

/** Deterministic pseudo-random dots so the pattern is stable across renders. */
const QR_DOTS: { x: number; y: number }[] = (() => {
  let seed = 7
  const dots: { x: number; y: number }[] = []
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (seed * 9301 + 49297) % 233280
      if (!isFinderCell(x, y) && seed / 233280 > 0.52) dots.push({ x, y })
    }
  }
  return dots
})()

const FINDER_ORIGINS = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
] as const

/** A stylised, non-scannable QR-like pattern used purely as decoration. */
export function DecorativeQr({ className }: { className?: string }) {
  return (
    <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} aria-hidden className={className}>
      {QR_DOTS.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.42} fill="currentColor" />
      ))}
      {FINDER_ORIGINS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect
            x={x + 0.5}
            y={y + 0.5}
            width={6}
            height={6}
            rx={1.8}
            fill="none"
            stroke="currentColor"
          />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.9} className="fill-brass" />
        </g>
      ))}
    </svg>
  )
}

export function SampleCardFront({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'flex aspect-[7/4] w-[min(22rem,calc(100vw-5rem))] flex-col justify-between rounded-2xl border border-line bg-surface p-5 text-left text-ink shadow-lift sm:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-brass to-brass-strong text-sm font-semibold text-white sm:size-12">
            AM
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight font-semibold tracking-tight">
              Alex Morgan
            </p>
            <p className="mt-0.5 text-xs text-muted">Principal Architect</p>
          </div>
        </div>
        <span className="pt-1 text-[0.625rem] font-semibold tracking-[0.22em] text-muted uppercase">
          Northwind
        </span>
      </div>

      <ul className="space-y-1.5 text-[0.7rem] text-ink/80 sm:text-xs">
        <li className="flex items-center gap-2">
          <Phone className="size-3.5 text-brass-strong" /> +1 (416) 555-0142
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-3.5 text-brass-strong" /> alex@northwind.studio
        </li>
        <li className="flex items-center gap-2">
          <Globe className="size-3.5 text-brass-strong" /> northwind.studio
        </li>
      </ul>
    </div>
  )
}

export function SampleCardBack({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'flex aspect-[7/4] w-[min(22rem,calc(100vw-5rem))] items-center justify-between gap-4 rounded-2xl bg-ink p-5 text-white shadow-lift sm:p-6',
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between">
        <span className="text-[0.625rem] font-semibold tracking-[0.22em] text-brass uppercase">
          Scan to connect
        </span>
        <div>
          <p className="font-display text-xl leading-tight font-medium">Northwind</p>
          <p className="mt-1 text-[0.7rem] text-white/60">northwind.studio/alex</p>
        </div>
      </div>
      <div className="rounded-xl bg-white p-2.5 text-ink">
        <DecorativeQr className="size-20 sm:size-24" />
      </div>
    </div>
  )
}
