export const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || 'Tessera'

/** Base path the app is served from, always with a trailing slash ("/" or "/card/"). */
export const BASE_PATH = import.meta.env.BASE_URL

/** Router basename: the base path without its trailing slash ("/" stays "/"). */
export const ROUTER_BASENAME = BASE_PATH.replace(/\/+$/, '') || '/'

/** Absolute origin + base path that public card links and QR codes point to. */
export function getPublicBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  return `${window.location.origin}${ROUTER_BASENAME === '/' ? '' : ROUTER_BASENAME}`
}

export function getPublicCardUrl(slug: string): string {
  return `${getPublicBaseUrl()}/c/${encodeURIComponent(slug)}`
}
