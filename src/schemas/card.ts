import { z } from './zod'
import { getLinkValueError, LINK_TYPES, normalizeLinkValue, resolveLinkType } from '@/utils/links'

/*
 * The card schema is the single source of truth: TypeScript types are inferred from it
 * (src/types/card.ts), forms validate with it, and Firestore reads are parsed with it.
 * Keep the limits in sync with firestore.rules.
 */

export const PHONE_LABELS = ['mobile', 'work', 'home', 'fax', 'other'] as const
export const TEMPLATE_IDS = ['modern-minimal', 'corporate-classic', 'bold-gradient'] as const
export const FONT_IDS = ['modern', 'editorial', 'geometric'] as const
export const CARD_MODES = ['light', 'dark'] as const
export const PHOTO_SHAPES = ['circle', 'rounded'] as const
export const COVER_TYPES = ['color', 'image'] as const
export const QR_DOT_STYLES = [
  'square',
  'dots',
  'rounded',
  'extra-rounded',
  'classy',
  'classy-rounded',
] as const
export const QR_CORNER_SQUARE_STYLES = ['square', 'dot', 'extra-rounded'] as const
export const QR_CORNER_DOT_STYLES = ['square', 'dot'] as const

export const LIMITS = {
  label: 60,
  name: 100,
  email: 254,
  phone: 30,
  phones: 5,
  address: 300,
  bio: 300,
  credential: 120,
  links: 100,
  linkLabel: 60,
  url: 2048,
} as const

/** Images are stored inline as data URLs; see utils/image.ts for how they're produced. */
export const MAX_IMAGE_DATA_URL_LENGTH = 200_000
export const IMAGE_DATA_URL_PATTERN = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`)

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a 6-digit hex color like #1e3a5f')

const PHONE_PATTERN = /^\+?[\d\s().-]+(?:\s*(?:ext\.?|x)\s*\d{1,6})?$/i
const emailFormat = z.email()

function isPhoneOrEmpty(value: string): boolean {
  if (value === '') return true
  const digits = value.replace(/\D/g, '').length
  return PHONE_PATTERN.test(value) && digits >= 5 && digits <= 20
}

const imageDataUrl = z
  .string()
  .max(MAX_IMAGE_DATA_URL_LENGTH, 'This image is too large')
  .regex(IMAGE_DATA_URL_PATTERN, 'Unsupported image format')

export const phoneSchema = z.object({
  label: z.enum(PHONE_LABELS),
  number: text(LIMITS.phone).refine(isPhoneOrEmpty, 'Enter a valid phone number'),
})

export const profileSchema = z.object({
  fullName: text(LIMITS.name),
  jobTitle: text(LIMITS.name),
  company: text(LIMITS.name),
  department: text(LIMITS.name),
  email: text(LIMITS.email).refine(
    (value) => value === '' || emailFormat.safeParse(value).success,
    'Enter a valid email address',
  ),
  phones: z.array(phoneSchema).max(LIMITS.phones),
  address: text(LIMITS.address),
  bio: text(LIMITS.bio),
  credential: text(LIMITS.credential),
})

/**
 * Accepts what people type ("@benny", "benny.dev", "+1 416…") and outputs the normalized
 * link: https:// added, handles expanded, platform auto-detected. Empty values are allowed
 * (an unfinished link is saved but not shown on the card).
 */
export const linkSchema = z
  .object({
    id: z.string().min(1).max(40),
    type: z.enum(LINK_TYPES),
    label: text(LIMITS.linkLabel),
    url: z.string().trim().max(LIMITS.url, 'This link is too long'),
    visible: z.boolean(),
    order: z.number().int().min(0),
  })
  .transform((link) => {
    const url = normalizeLinkValue(link.type, link.url)
    return { ...link, url, type: resolveLinkType(link.type, url) }
  })
  .superRefine((link, context) => {
    const error = getLinkValueError(link.type, link.url)
    if (error) context.addIssue({ code: 'custom', message: error, path: ['url'] })
  })

export const themeSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  accent: hexColor,
  mode: z.enum(CARD_MODES),
  font: z.enum(FONT_IDS),
  photoShape: z.enum(PHOTO_SHAPES),
  coverType: z.enum(COVER_TYPES),
  coverColor: hexColor,
})

export const qrSchema = z.object({
  dotStyle: z.enum(QR_DOT_STYLES),
  cornerSquareStyle: z.enum(QR_CORNER_SQUARE_STYLES),
  cornerDotStyle: z.enum(QR_CORNER_DOT_STYLES),
  foreground: hexColor,
  background: hexColor,
  gradient: z.boolean(),
  gradientColor: hexColor,
  showLogo: z.boolean(),
})

/** Everything the owner edits. Firestore metadata (owner, slug, timestamps) lives outside it. */
export const cardContentSchema = z.object({
  label: text(LIMITS.label),
  profile: profileSchema,
  photo: imageDataUrl.nullable(),
  logo: imageDataUrl.nullable(),
  /** Cover image, shown when theme.coverType is "image". */
  cover: imageDataUrl.nullable(),
  links: z.array(linkSchema).max(LIMITS.links),
  theme: themeSchema,
  qr: qrSchema,
})
