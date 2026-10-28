import { clsx } from 'clsx'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

interface FormAlertProps {
  tone?: 'error' | 'success'
  children: ReactNode
  className?: string
}

export function FormAlert({ tone = 'error', children, className }: FormAlertProps) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        tone === 'error'
          ? 'border-danger/20 bg-danger-soft text-danger'
          : 'border-success/20 bg-success-soft text-success',
        className,
      )}
    >
      <Icon aria-hidden className="mt-px size-[1.125rem] shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}
