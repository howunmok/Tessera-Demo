import { describeCard, type CardSummary } from '../../src/utils/card-meta.ts'

/*
 * Shared by the Netlify edge functions. Reads a public card straight from Firestore's REST
 * API (the same unauthenticated "get" the public page makes; listing stays blocked by the
 * rules) and builds link-preview <meta> tags. Only the fields needed are requested.
 */

export interface FirebaseEnv {
  projectId: string
  apiKey?: string
  appName: string
}

interface FirestoreValue {
  stringValue?: string
  mapValue?: { fields?: Record<string, FirestoreValue> }
}
type Fields = Record<string, FirestoreValue>

/** Social and search crawlers that read link-preview tags (they don't run JavaScript). */
export const PREVIEW_BOT =
  /bot|crawl|spider|facebookexternalhit|facebot|whatsapp|telegram|slack|discord|linkedin|embedly|preview|skype|vkshare|pinterest|quora|iframely|mastodon|bluesky|google|bing|yandex|duckduck/i

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const IMAGE_DATA_URL = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/

export function isValidSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 40 && SLUG_PATTERN.test(slug)
}

async function getFields(env: FirebaseEnv, path: string, mask: string[]): Promise<Fields | null> {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.projectId)}/databases/(default)/documents/${path}`,
  )
  for (const field of mask) url.searchParams.append('mask.fieldPaths', field)
  if (env.apiKey) url.searchParams.set('key', env.apiKey)

  const response = await fetch(url, { signal: AbortSignal.timeout(2500) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Firestore responded ${String(response.status)}`)
  const body = (await response.json()) as { fields?: Fields }
  return body.fields ?? {}
}

const text = (fields: Fields | undefined, key: string) => fields?.[key]?.stringValue ?? ''

/** Fields of the card a slug points to, or null. Two document reads. */
async function getCardFields(env: FirebaseEnv, slug: string, mask: string[]) {
  const slugDoc = await getFields(env, `slugs/${slug}`, ['cardId'])
  const cardId = text(slugDoc ?? undefined, 'cardId')
  if (!cardId) return null
  const card = await getFields(env, `cards/${encodeURIComponent(cardId)}`, ['slug', ...mask])
  return card && text(card, 'slug') === slug ? card : null
}

export async function getCardPreview(
  env: FirebaseEnv,
  slug: string,
): Promise<(CardSummary & { hasPhoto: boolean }) | null> {
  const card = await getCardFields(env, slug, [
    'profile.fullName',
    'profile.jobTitle',
    'profile.company',
    'profile.bio',
    'photo',
  ])
  if (!card) return null
  const profile = card.profile?.mapValue?.fields
  return {
    fullName: text(profile, 'fullName'),
    jobTitle: text(profile, 'jobTitle'),
    company: text(profile, 'company'),
    bio: text(profile, 'bio'),
    hasPhoto: IMAGE_DATA_URL.test(text(card, 'photo')),
  }
}

/** The card's profile photo as image bytes, or null. */
export async function getCardPhoto(
  env: FirebaseEnv,
  slug: string,
): Promise<{ bytes: Uint8Array<ArrayBuffer>; type: string } | null> {
  const card = await getCardFields(env, slug, ['photo'])
  const match = IMAGE_DATA_URL.exec(text(card ?? undefined, 'photo'))
  if (!match?.[1] || !match[2]) return null
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0))
  return { bytes, type: match[1] }
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

/**
 * Replaces the page's title and site-wide preview tags with the card's own. Cards stay out
 * of search results (they hold phone numbers and emails).
 */
export function injectCardMeta(
  html: string,
  card: CardSummary & { hasPhoto: boolean },
  { cardUrl, imageUrl, appName }: { cardUrl: string; imageUrl: string; appName: string },
): string {
  const { title, description } = describeCard(card)
  const tags: [attribute: string, key: string, value: string][] = [
    ['name', 'description', description],
    ['name', 'robots', 'noindex'],
    ['property', 'og:type', 'profile'],
    ['property', 'og:site_name', appName],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', cardUrl],
    ['name', 'twitter:card', 'summary'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
  ]
  if (card.hasPhoto) {
    tags.push(
      ['property', 'og:image', imageUrl],
      ['property', 'og:image:width', '400'],
      ['property', 'og:image:height', '400'],
      ['property', 'og:image:alt', card.fullName ? `Photo of ${card.fullName}` : 'Profile photo'],
      ['name', 'twitter:image', imageUrl],
    )
  }

  const block = tags
    .map(
      ([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    )
    .join('\n    ')

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(`${title} · ${appName}`)}</title>`)
    .replace(
      /<meta\s[^>]*?(?:name|property)="(?:description|robots|og:[^"]*|twitter:[^"]*)"[^>]*>\s*/gi,
      '',
    )
    .replace('</head>', `  ${block}\n  </head>`)
}
