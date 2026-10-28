export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

const INK = '#15151c'
const WHITE = '#ffffff'

function toRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function channel(value: number): number {
  const srgb = value / 255
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance of a #rrggbb color (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two colors, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (light + 0.05) / (dark + 0.05)
}

/** True when dark text reads better than white text on this color. */
export function isLightColor(hex: string): boolean {
  return contrastRatio(hex, INK) > contrastRatio(hex, WHITE)
}

/** Ink or white — whichever is more readable on `background`. */
export function readableTextOn(background: string): string {
  return isLightColor(background) ? INK : WHITE
}

/** Mixes two colors; `amount` is how much of `b` to blend in (0–1). */
export function mixColors(a: string, b: string, amount: number): string {
  const [r1, g1, b1] = toRgb(a)
  const [r2, g2, b2] = toRgb(b)
  const blend = (from: number, to: number) => from + (to - from) * amount
  return toHex([blend(r1, r2), blend(g1, g2), blend(b1, b2)])
}

/**
 * Returns `color`, nudged darker (on light backgrounds) or lighter (on dark ones) just
 * enough to reach `minRatio` contrast against `background`. WCAG AA body text needs 4.5.
 */
export function ensureContrast(color: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(color, background) >= minRatio) return color
  const target = isLightColor(background) ? '#000000' : WHITE
  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const candidate = mixColors(color, target, amount)
    if (contrastRatio(candidate, background) >= minRatio) return candidate
  }
  return target
}
