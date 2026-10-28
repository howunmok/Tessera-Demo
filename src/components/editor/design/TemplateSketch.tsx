import { clsx } from 'clsx'
import { getCardStyle, MESH_GRADIENT } from '@/components/card/card-style'
import type { CardTheme } from '@/types/card'

/*
 * Miniature wireframes of each template, painted in the card's current colors and mode,
 * so the picker previews what each layout will look like.
 */

const bar = 'block rounded-full'

export function TemplateSketch({ theme }: { theme: CardTheme }) {
  return (
    <div
      aria-hidden
      style={getCardStyle(theme)}
      className="h-40 overflow-hidden rounded-xl bg-(--card-bg) shadow-xs ring-1 ring-(--card-line)"
    >
      {theme.template === 'modern-minimal' && <ModernSketch />}
      {theme.template === 'corporate-classic' && <ClassicSketch />}
      {theme.template === 'bold-gradient' && <BoldSketch />}
    </div>
  )
}

function ModernSketch() {
  return (
    <>
      <div className="relative h-10 bg-(--card-cover)">
        <span className="absolute top-2 right-2 h-3 w-7 rounded-sm bg-white/90" />
      </div>
      <div className="px-3">
        <span className="-mt-4 block size-8 rounded-full bg-(--card-accent) ring-2 ring-(--card-bg)" />
        <span className={clsx(bar, 'mt-2 h-2 w-20 bg-(--card-fg)')} />
        <span className={clsx(bar, 'mt-1.5 h-1.5 w-14 bg-(--card-muted) opacity-50')} />
        <span className={clsx(bar, 'mt-1 h-1.5 w-16 bg-(--card-accent-text) opacity-80')} />
        <div className="mt-3 grid grid-cols-3 gap-1">
          {[0, 1, 2].map((key) => (
            <span key={key} className="h-5 rounded-md border border-(--card-line)" />
          ))}
        </div>
        <span className="mt-1.5 block h-4 rounded-md border border-(--card-line)" />
      </div>
    </>
  )
}

function ClassicSketch() {
  return (
    <>
      <div className="relative h-8 bg-(--card-cover)">
        <span className="absolute top-1.5 right-2 h-3 w-7 rounded-sm bg-white/90" />
      </div>
      <div className="h-0.5 bg-(--card-accent)" />
      <div className="flex flex-col items-center px-3">
        <span className="-mt-4 block size-8 rounded-full bg-(--card-accent) ring-2 ring-(--card-bg)" />
        <span className={clsx(bar, 'mt-2 h-2 w-20 bg-(--card-fg)')} />
        <span className={clsx(bar, 'mt-1.5 h-1 w-16 bg-(--card-accent-text) opacity-80')} />
        <span className="my-2 flex w-12 items-center gap-1">
          <span className="h-px flex-1 bg-(--card-line-strong)" />
          <span className="size-1 rotate-45 bg-(--card-accent)" />
          <span className="h-px flex-1 bg-(--card-line-strong)" />
        </span>
        <span className="block h-4 w-full rounded-md bg-(--card-accent)" />
        <div className="mt-1 grid w-full grid-cols-2 gap-1">
          <span className="h-4 rounded-md border border-(--card-line-strong)" />
          <span className="h-4 rounded-md border border-(--card-line-strong)" />
        </div>
      </div>
    </>
  )
}

function BoldSketch() {
  return (
    <>
      <div className="relative h-[4.5rem] px-3 pt-2.5" style={{ background: MESH_GRADIENT }}>
        <span className="block size-6 rounded-full bg-(--card-accent) ring-1 ring-white/50" />
        <span className="absolute top-2.5 right-2.5 h-3 w-7 rounded-sm bg-white/90" />
        <span className={clsx(bar, 'mt-2.5 h-2.5 w-24 bg-(--card-on-cover)')} />
        <span className={clsx(bar, 'mt-1.5 h-1.5 w-14 bg-(--card-on-cover) opacity-70')} />
      </div>
      <div className="relative -mt-2 rounded-t-xl bg-(--card-bg) px-3 pt-3">
        <div className="flex gap-1">
          <span className="h-5 flex-1 rounded-full bg-(--card-accent)" />
          <span className="size-5 rounded-full bg-(--card-tint)" />
          <span className="size-5 rounded-full bg-(--card-tint)" />
        </div>
        <span className="mt-1.5 block h-4 rounded-md bg-(--card-surface)" />
        <span className="mt-1 block h-4 rounded-md bg-(--card-surface)" />
      </div>
    </>
  )
}
