import { clsx } from 'clsx'
import { APP_NAME } from '@/config/app'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={clsx('size-8 shrink-0', className)}>
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <rect x="8" y="8" width="7" height="7" rx="1.75" fill="#fff" />
      <rect x="17" y="8" width="7" height="7" rx="1.75" fill="#fff" fillOpacity=".4" />
      <rect x="8" y="17" width="7" height="7" rx="1.75" fill="#fff" fillOpacity=".4" />
      <rect x="17" y="17" width="7" height="7" rx="1.75" className="fill-brass" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight">{APP_NAME}</span>
    </span>
  )
}
