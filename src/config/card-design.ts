import type { CardTheme } from '@/types/card'

type TemplateId = CardTheme['template']
type FontId = CardTheme['font']

export const TEMPLATES: Record<TemplateId, { name: string; description: string }> = {
  'modern-minimal': {
    name: 'Modern Minimal',
    description: 'Clean and airy, with an overlapping photo.',
  },
  'corporate-classic': {
    name: 'Corporate Classic',
    description: 'Centered and formal, like a printed card.',
  },
  'bold-gradient': {
    name: 'Bold Gradient',
    description: 'Your name front and center on a rich backdrop.',
  },
}

const SANS_FALLBACK = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
const INTER = `'Inter Variable', ${SANS_FALLBACK}`

/** Font pairings (Google Fonts, self-hosted via Fontsource). */
export const CARD_FONTS: Record<
  FontId,
  { name: string; sample: string; heading: string; body: string }
> = {
  modern: { name: 'Modern', sample: 'Inter', heading: INTER, body: INTER },
  editorial: {
    name: 'Editorial',
    sample: 'Fraunces & Inter',
    heading: "'Fraunces Variable', ui-serif, Georgia, serif",
    body: INTER,
  },
  geometric: {
    name: 'Geometric',
    sample: 'Plus Jakarta Sans',
    heading: `'Plus Jakarta Sans Variable', ${SANS_FALLBACK}`,
    body: `'Plus Jakarta Sans Variable', ${SANS_FALLBACK}`,
  },
}
