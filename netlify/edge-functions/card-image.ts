import { getCardPhoto, isValidSlug } from '../shared/card-preview.ts'
import { readEnv } from '../shared/env.ts'

/**
 * Netlify edge function for /og/:slug (declared in netlify.toml): the card's profile photo
 * as a real image URL, for link previews (og:image can't be a data URL).
 */
export default async function cardImage(request: Request): Promise<Response> {
  const slug = new URL(request.url).pathname.split('/')[2] ?? ''
  const env = readEnv()
  if (!env || !isValidSlug(slug)) return new Response('Not found', { status: 404 })

  try {
    const photo = await getCardPhoto(env, slug)
    if (!photo) return new Response('Not found', { status: 404 })
    return new Response(photo.bytes, {
      headers: {
        'content-type': photo.type,
        'cache-control': 'public, max-age=3600',
        'x-robots-tag': 'noindex',
      },
    })
  } catch {
    return new Response('Temporarily unavailable', { status: 503 })
  }
}
