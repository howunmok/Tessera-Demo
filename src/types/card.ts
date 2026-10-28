import type { z } from 'zod'
import type {
  cardContentSchema,
  linkSchema,
  phoneSchema,
  profileSchema,
  qrSchema,
  themeSchema,
} from '@/schemas/card'

export type CardContent = z.output<typeof cardContentSchema>
export type CardProfile = z.output<typeof profileSchema>
export type CardPhone = z.output<typeof phoneSchema>
export type CardLink = z.output<typeof linkSchema>
export type CardTheme = z.output<typeof themeSchema>
export type QrSettings = z.output<typeof qrSchema>

export type PhoneLabel = CardPhone['label']
export type PhotoShape = CardTheme['photoShape']
export type CoverType = CardTheme['coverType']
export type { LinkType } from '@/utils/links'

/** A card as stored in Firestore (`cards/{id}`), with timestamps converted to Dates. */
export interface Card extends CardContent {
  id: string
  ownerUid: string
  slug: string
  schemaVersion: number
  createdAt: Date
  updatedAt: Date
}
