import type { Options } from 'qr-code-styling'
import type { QrSettings } from '@/types/card'
import { contrastRatio, relativeLuminance } from './color'

/*
 * QR code helpers: qr-code-styling options from a card's settings, and scan-reliability
 * checks. Scanners need a clear light/dark difference, and most expect dark modules on a
 * light background.
 */

/** Quiet zone around the code, as a share of its size (scanners need clear space). */
const MARGIN_RATIO = 0.08
/** Center logo size, as a share of the code. Safe with error correction level H. */
const LOGO_SIZE = 0.32

export function buildQrOptions(
  qr: QrSettings,
  { data, logo, size }: { data: string; logo: string | null; size: number },
): Partial<Options> {
  const withLogo = qr.showLogo && logo !== null
  const paint = qr.gradient
    ? {
        gradient: {
          type: 'linear' as const,
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: qr.foreground },
            { offset: 1, color: qr.gradientColor },
          ],
        },
      }
    : { color: qr.foreground }

  return {
    width: size,
    height: size,
    margin: Math.round(size * MARGIN_RATIO),
    data,
    // H (30% recoverable) when the logo covers part of the code; M is less dense otherwise.
    qrOptions: { errorCorrectionLevel: withLogo ? 'H' : 'M' },
    image: withLogo ? logo : undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: LOGO_SIZE,
      margin: Math.round(size * 0.012),
    },
    dotsOptions: { type: qr.dotStyle, ...paint },
    cornersSquareOptions: { type: qr.cornerSquareStyle, ...paint },
    cornersDotOptions: { type: qr.cornerDotStyle, ...paint },
    backgroundOptions: { color: qr.background },
  }
}

export interface QrScanIssue {
  level: 'error' | 'warning'
  message: string
}

/** Problems that could stop phones from scanning the code, worst first. */
export function getQrScanIssues(qr: QrSettings): QrScanIssue[] {
  const issues: QrScanIssue[] = []
  const moduleColors = qr.gradient ? [qr.foreground, qr.gradientColor] : [qr.foreground]
  const ratio = Math.min(...moduleColors.map((color) => contrastRatio(color, qr.background)))
  const shown = `${ratio.toFixed(1)}:1`

  if (ratio < 3) {
    issues.push({
      level: 'error',
      message: `The code and background are too similar (${shown}) for phones to scan reliably. Use a darker code color or a lighter background.`,
    })
  } else if (ratio < 4.5) {
    issues.push({
      level: 'warning',
      message: `Contrast is on the low side (${shown}). Test it with a couple of phones before printing.`,
    })
  }

  const background = relativeLuminance(qr.background)
  if (moduleColors.some((color) => relativeLuminance(color) > background)) {
    issues.push({
      level: 'warning',
      message:
        'A light code on a dark background is “inverted”, and some scanner apps can’t read it. Dark on light is the safest.',
    })
  }

  return issues
}
