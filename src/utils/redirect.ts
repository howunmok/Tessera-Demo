const DEFAULT_REDIRECT = '/dashboard'

/**
 * Where to send the user after signing in: the protected page they originally asked for
 * (stored in location.state by <RequireAuth>), or the dashboard.
 */
export function getRedirectTarget(locationState: unknown): string {
  if (typeof locationState !== 'object' || locationState === null || !('from' in locationState)) {
    return DEFAULT_REDIRECT
  }

  const { from } = locationState
  if (typeof from !== 'object' || from === null || !('pathname' in from)) return DEFAULT_REDIRECT

  const { pathname } = from
  // Only allow in-app paths, never protocol-relative or external URLs.
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return DEFAULT_REDIRECT
  }

  const search = 'search' in from && typeof from.search === 'string' ? from.search : ''
  return `${pathname}${search}`
}
