export interface ColorPreset {
  name: string
  value: string
}

export interface PalettePreset {
  name: string
  accent: string
  cover: string
}

/** Two-tone starting points: an accent for text and buttons, and a cover color. */
export const PALETTE_PRESETS: readonly PalettePreset[] = [
  { name: 'Classic Navy', accent: '#1e3a5f', cover: '#1e3a5f' },
  { name: 'Ink & Brass', accent: '#8a6530', cover: '#15151c' },
  { name: 'Sapphire', accent: '#2343a8', cover: '#0f1b3d' },
  { name: 'Evergreen', accent: '#2f6b4f', cover: '#1f4d3a' },
  { name: 'Lagoon', accent: '#0f766e', cover: '#0f5e5a' },
  { name: 'Bordeaux', accent: '#8c2a3a', cover: '#5c1a26' },
  { name: 'Terracotta', accent: '#a3471f', cover: '#b4532a' },
  { name: 'Aubergine', accent: '#6b3f82', cover: '#3d2350' },
]

/** Accent colors. Text uses an automatically darkened/lightened version when needed. */
export const ACCENT_COLOR_PRESETS: readonly ColorPreset[] = [
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Royal', value: '#2343a8' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Emerald', value: '#047857' },
  { name: 'Forest', value: '#2f6b4f' },
  { name: 'Burgundy', value: '#8c2a3a' },
  { name: 'Crimson', value: '#b42318' },
  { name: 'Terracotta', value: '#a3471f' },
  { name: 'Brass', value: '#8a6530' },
  { name: 'Plum', value: '#6b3f82' },
  { name: 'Slate', value: '#475569' },
  { name: 'Ink', value: '#15151c' },
]

/** Curated, professional colors for card covers. */
export const COVER_COLOR_PRESETS: readonly ColorPreset[] = [
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Midnight', value: '#15151c' },
  { name: 'Slate', value: '#3f4a5a' },
  { name: 'Royal', value: '#2343a8' },
  { name: 'Teal', value: '#0f5e5a' },
  { name: 'Forest', value: '#1f4d3a' },
  { name: 'Plum', value: '#4b2b5c' },
  { name: 'Burgundy', value: '#6e1f2c' },
  { name: 'Terracotta', value: '#b4532a' },
  { name: 'Brass', value: '#a07a3c' },
  { name: 'Sand', value: '#d9c7a7' },
  { name: 'Mist', value: '#c9d3dd' },
]

/** QR code colors: dark enough to scan on the light backgrounds below. */
export const QR_CODE_COLOR_PRESETS: readonly ColorPreset[] = [
  { name: 'Ink', value: '#15151c' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Royal', value: '#2343a8' },
  { name: 'Forest', value: '#1f4d3a' },
  { name: 'Burgundy', value: '#6e1f2c' },
  { name: 'Plum', value: '#4b2b5c' },
  { name: 'Brass', value: '#7a5a2a' },
]

export const QR_BACKGROUND_PRESETS: readonly ColorPreset[] = [
  { name: 'White', value: '#ffffff' },
  { name: 'Ivory', value: '#fbf7ef' },
  { name: 'Mist', value: '#eef2f6' },
  { name: 'Sand', value: '#f2e8d8' },
]

export const QR_GRADIENT_PRESETS: readonly ColorPreset[] = [
  { name: 'Royal', value: '#2343a8' },
  { name: 'Teal', value: '#0f766e' },
  { name: 'Terracotta', value: '#a3471f' },
  { name: 'Plum', value: '#6b3f82' },
  { name: 'Crimson', value: '#b42318' },
]

/** Puts the card's accent first in a preset list (without duplicating it). */
export function withCardAccent(presets: readonly ColorPreset[], accent: string): ColorPreset[] {
  const rest = presets.filter((preset) => preset.value.toLowerCase() !== accent.toLowerCase())
  return [{ name: 'Card accent', value: accent }, ...rest]
}
