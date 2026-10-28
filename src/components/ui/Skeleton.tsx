import { clsx } from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-pulse rounded-lg bg-ink/[0.06] motion-reduce:animate-none',
        className,
      )}
    />
  )
}
