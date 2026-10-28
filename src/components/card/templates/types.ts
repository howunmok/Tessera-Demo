import type { CardContent } from '@/types/card'

export type CardRenderContent = Pick<
  CardContent,
  'profile' | 'photo' | 'logo' | 'cover' | 'links' | 'theme'
>

export interface TemplateProps {
  content: CardRenderContent
  /** "preview": editor preview (nothing is clickable). "live": the public card. */
  mode: 'preview' | 'live'
  /** Live card only: downloads the contact (vCard). */
  onSaveContact?: () => void
}
