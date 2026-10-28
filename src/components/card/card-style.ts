import type { CSSProperties } from 'react'
import { CARD_FONTS } from '@/config/card-design'
import type { CardTheme } from '@/types/card'
import { ensureContrast, mixColors, readableTextOn } from '@/utils/color'

/*
 * Cards get their own CSS variables (independent of the app's chrome), so every template
 * can be themed per card. Templates use them via Tailwind, e.g. `bg-(--card-bg)`.
 *
 *   --card-bg / -surface / -fg / -muted / -line / -line-strong   light or dark palette
 *   --card-accent        the accent for fills (buttons, initials), nudged to ≥ 3:1 against
 *                        the card so buttons stay visible (WCAG non-text contrast)
 *   --card-accent-text   the accent for text: ≥ 4.5:1 (AA), or 6:1 on dark cards for crispness
 *   --card-on-accent     ink or white, whichever reads best on --card-accent
 *   --card-tint          a soft accent wash for chips and icon backgrounds
 *   --card-cover / --card-on-cover   cover color and readable text on it
 *   --card-font-heading / --card-font-body
 */

const PALETTES = {
  light: {
    bg: '#ffffff',
    surface: '#f6f6f8',
    fg: '#15151c',
    muted: '#5f5e66',
    line: 'rgb(21 21 28 / 0.08)',
    lineStrong: 'rgb(21 21 28 / 0.16)',
    tintAmount: 0.1,
  },
  dark: {
    bg: '#15151b',
    surface: '#1e1e26',
    fg: '#f4f4f6',
    muted: '#a5a4ad',
    line: 'rgb(255 255 255 / 0.09)',
    lineStrong: 'rgb(255 255 255 / 0.18)',
    tintAmount: 0.2,
  },
} as const

/** The accent colors actually used on a card, adjusted for contrast. */
function getAccentColors(theme: CardTheme) {
  const palette = PALETTES[theme.mode]
  const fill = ensureContrast(theme.accent, palette.bg, 3)
  const tint = mixColors(palette.bg, fill, palette.tintAmount)
  // Checked against the tint, the closest background accent text ever sits on.
  const text = ensureContrast(theme.accent, tint, theme.mode === 'dark' ? 6 : 4.5)
  return { fill, tint, text }
}

export function getCardStyle(theme: CardTheme): CSSProperties {
  const palette = PALETTES[theme.mode]
  const fonts = CARD_FONTS[theme.font]
  const accent = getAccentColors(theme)

  return {
    '--card-bg': palette.bg,
    '--card-surface': palette.surface,
    '--card-fg': palette.fg,
    '--card-muted': palette.muted,
    '--card-line': palette.line,
    '--card-line-strong': palette.lineStrong,
    '--card-accent': accent.fill,
    '--card-accent-text': accent.text,
    '--card-on-accent': readableTextOn(accent.fill),
    '--card-tint': accent.tint,
    '--card-cover': theme.coverColor,
    '--card-on-cover': readableTextOn(theme.coverColor),
    '--card-font-heading': fonts.heading,
    '--card-font-body': fonts.body,
    fontFamily: 'var(--card-font-body)',
  } as CSSProperties
}

/** Whether the accent had to be adjusted on this card to keep text and buttons readable. */
export function isAccentAdjusted(theme: CardTheme): boolean {
  const { fill, text } = getAccentColors(theme)
  return fill !== theme.accent || text !== theme.accent
}

/**
 * Bold Gradient's backdrop: the cover color, warmed by the accent at the top-right and
 * deepened at the bottom-left, where the name sits, to keep text contrast high.
 */
export const MESH_GRADIENT = [
  'radial-gradient(90% 80% at 100% 0%, color-mix(in oklab, var(--card-accent) 70%, white) 0%, transparent 65%)',
  'radial-gradient(85% 75% at 0% 100%, color-mix(in oklab, var(--card-cover) 80%, black) 0%, transparent 70%)',
  'linear-gradient(150deg, var(--card-cover) 0%, color-mix(in oklab, var(--card-cover) 55%, var(--card-accent)) 100%)',
].join(', ')
