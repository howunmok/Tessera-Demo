import { clsx } from 'clsx'
import QRCodeStyling, { type Options } from 'qr-code-styling'
import { useEffect, useRef } from 'react'

/**
 * Renders a styled QR code that scales to its container.
 * Pass memoized `options`: the code is redrawn whenever the object changes.
 *
 * Drawn on a canvas at the options' size and scaled by the browser: an SVG scaled to a
 * fractional size shows hairline seams between adjacent modules.
 */
export function QrCodeView({
  options,
  label,
  className,
}: {
  options: Partial<Options>
  /** Accessible description, e.g. "QR code linking to …". Omit for decorative previews. */
  label?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const qr = new QRCodeStyling({ ...options, type: 'canvas' })
    container.replaceChildren()
    qr.append(container)
    return () => {
      container.replaceChildren()
    }
  }, [options])

  return (
    <div
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx('[&>canvas]:block [&>canvas]:h-auto [&>canvas]:w-full', className)}
    />
  )
}
