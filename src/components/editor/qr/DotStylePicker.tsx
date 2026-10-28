import { clsx } from 'clsx'
import { useId, useMemo } from 'react'
import { QrCodeView } from '@/components/qr/QrCodeView'
import { DEFAULT_QR } from '@/config/card-defaults'
import { QR_DOT_STYLES } from '@/schemas/card'
import type { QrSettings } from '@/types/card'
import { buildQrOptions } from '@/utils/qr'

const NAMES: Record<QrSettings['dotStyle'], string> = {
  square: 'Square',
  dots: 'Dots',
  rounded: 'Rounded',
  'extra-rounded': 'Extra rounded',
  classy: 'Classy',
  'classy-rounded': 'Classy rounded',
}

/** Radio tiles, each showing a zoomed-in piece of a real QR in that dot style. */
export function DotStylePicker({
  qr,
  onChange,
}: {
  qr: QrSettings
  onChange: (style: QrSettings['dotStyle']) => void
}) {
  const name = useId()

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium">Dot style</legend>
      <div className="grid grid-cols-3 gap-2.5">
        {QR_DOT_STYLES.map((style) => {
          const selected = style === qr.dotStyle
          return (
            <label
              key={style}
              className={clsx(
                'relative cursor-pointer rounded-2xl border bg-surface p-2 text-center transition-[border-color,box-shadow] duration-150',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
                selected
                  ? 'border-ink shadow-soft ring-1 ring-ink'
                  : 'border-line hover:border-ink/30',
              )}
            >
              <input
                type="radio"
                name={name}
                value={style}
                checked={selected}
                onChange={() => {
                  onChange(style)
                }}
                className="sr-only"
              />
              <DotSample qr={qr} dotStyle={style} />
              <span className="mt-1.5 block text-xs font-medium">{NAMES[style]}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** The middle of a sample code, enlarged so the module shapes are easy to compare. */
function DotSample({ qr, dotStyle }: { qr: QrSettings; dotStyle: QrSettings['dotStyle'] }) {
  const { foreground, background, cornerSquareStyle, cornerDotStyle } = qr
  const options = useMemo(
    () =>
      buildQrOptions(
        {
          ...DEFAULT_QR,
          dotStyle,
          foreground,
          background,
          cornerSquareStyle,
          cornerDotStyle,
        },
        { data: 'https://example.com/c/sample', logo: null, size: 240 },
      ),
    [dotStyle, foreground, background, cornerSquareStyle, cornerDotStyle],
  )
  return (
    <span
      className="relative mx-auto block aspect-square w-full max-w-20 overflow-hidden rounded-lg"
      style={{ backgroundColor: background }}
    >
      <QrCodeView options={options} className="absolute top-[-55%] left-[-55%] w-[210%]" />
    </span>
  )
}
