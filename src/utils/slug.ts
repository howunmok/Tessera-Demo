export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 40

/** Same rule as isValidSlug() in firestore.rules. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function stripAccents(input: string): string {
  return input.normalize('NFKD').replace(/[̀-ͯ]/g, '')
}

/** Turns any text into a slug: "Benny Lee, CFA" → "benny-lee-cfa". */
export function slugify(input: string): string {
  return stripAccents(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '')
}

/**
 * Cleans slug text while the user types. Unlike slugify() it keeps a trailing hyphen,
 * so "benny-" can become "benny-lee".
 */
export function normalizeSlugInput(input: string): string {
  return stripAccents(input)
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX_LENGTH)
}

/** A user-facing problem with the slug, or null when it's valid. */
export function getSlugError(slug: string): string | null {
  if (slug.length < SLUG_MIN_LENGTH) return `Use at least ${SLUG_MIN_LENGTH} characters`
  if (slug.length > SLUG_MAX_LENGTH) return `Use at most ${SLUG_MAX_LENGTH} characters`
  if (slug.endsWith('-')) return 'Can’t end with a hyphen'
  if (!SLUG_PATTERN.test(slug)) return 'Use lowercase letters, numbers and single hyphens'
  return null
}

/** A slug suggestion from a name, with a random fallback for names that don't transliterate. */
export function suggestSlug(name: string): string {
  const slug = slugify(name)
  if (slug.length >= SLUG_MIN_LENGTH) return slug
  return `card-${Math.random().toString(36).slice(2, 7)}`
}
