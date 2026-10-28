// Fonts for the "Geometric" pairing; Inter and Fraunces are loaded app-wide. Browsers only
// download a font file once something on the page actually uses it.
import '@fontsource-variable/plus-jakarta-sans/index.css'
import type { ComponentType } from 'react'
import type { CardTheme } from '@/types/card'
import { BoldGradient } from './templates/BoldGradient'
import { CorporateClassic } from './templates/CorporateClassic'
import { ModernMinimal } from './templates/ModernMinimal'
import type { TemplateProps } from './templates/types'

const TEMPLATES: Record<CardTheme['template'], ComponentType<TemplateProps>> = {
  'modern-minimal': ModernMinimal,
  'corporate-classic': CorporateClassic,
  'bold-gradient': BoldGradient,
}

/**
 * Draws a card with its chosen template. The same component powers the editor preview,
 * the public card page and the PNG export, so what you edit is exactly what's shared.
 */
export function CardRenderer({
  content,
  mode = 'live',
  onSaveContact,
}: Partial<Pick<TemplateProps, 'mode'>> & Omit<TemplateProps, 'mode'>) {
  const Template = TEMPLATES[content.theme.template]
  return <Template content={content} mode={mode} onSaveContact={onSaveContact} />
}
