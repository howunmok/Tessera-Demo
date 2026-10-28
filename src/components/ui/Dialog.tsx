import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** While true, Escape, the backdrop and the close button are ignored (e.g. mid-save). */
  busy?: boolean
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

/**
 * Modal built on the native <dialog> element, which provides focus trapping,
 * Escape-to-close and an inert background.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  busy = false,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClick={(event) => {
        // A click on the <dialog> itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget && !busy) onClose()
      }}
      className={clsx(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-card bg-surface p-0 text-ink shadow-lift',
        'backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]',
        'scale-[0.97] opacity-0 transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-out-soft',
        'open:scale-100 open:opacity-100 starting:open:scale-[0.97] starting:open:opacity-0',
        'motion-reduce:transition-none',
        SIZES[size],
      )}
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-40"
            >
              <X aria-hidden className="size-[1.125rem]" />
            </button>
          </div>
          <div className="mt-5">{children}</div>
          {footer && (
            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
