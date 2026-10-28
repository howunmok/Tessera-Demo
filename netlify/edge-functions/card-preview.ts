import { getCardPreview, injectCardMeta, isValidSlug, PREVIEW_BOT } from '../shared/card-preview.ts'
import { readEnv, siteBaseUrl } from '../shared/env.ts'

/**
 * Netlify edge function for /c/* (declared in netlify.toml). Link-preview bots — WhatsApp,
 * LinkedIn, iMessage, Slack… — don't run JavaScript, so this puts the card's name, title
 * and photo into the HTML for them. Everyone else gets the normal page, untouched.
 * Any problem (missing config, Firestore slow or down) falls back to the normal page.
 */
export default async function cardPreview(
  request: Request,
  context: { next: () => Promise<Response> },
): Promise<Response> {
  const isBot = PREVIEW_BOT.test(request.headers.get('user-agent') ?? '')
  const slug = new URL(request.url).pathname.split('/')[2] ?? ''
  const env = readEnv()

  // Fetch the card while the page itself is being served, so bots aren't kept waiting.
  const previewPromise =
    isBot && env && isValidSlug(slug) ? getCardPreview(env, slug).catch(() => null) : null
  const [response, preview] = await Promise.all([context.next(), previewPromise])

  if (
    !env ||
    !preview ||
    response.status !== 200 ||
    !response.headers.get('content-type')?.includes('text/html')
  ) {
    return response
  }

  const base = siteBaseUrl(request)
  const html = injectCardMeta(await response.text(), preview, {
    cardUrl: `${base}/c/${slug}`,
    imageUrl: `${base}/og/${slug}`,
    appName: env.appName,
  })
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  return new Response(html, { status: 200, headers })
}
