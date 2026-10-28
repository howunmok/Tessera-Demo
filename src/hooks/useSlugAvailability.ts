import { useEffect, useState } from 'react'
import { getSlugOwner } from '@/lib/firebase/cards'
import { getSlugError } from '@/utils/slug'

export type SlugAvailability =
  | { status: 'idle' }
  | { status: 'invalid'; message: string }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'taken' }
  | { status: 'current' }
  | { status: 'error' }

const CHECK_DELAY_MS = 350

/** Checks (debounced) whether `slug` is free. `currentSlug` is the card's own slug, if any. */
export function useSlugAvailability(slug: string, currentSlug?: string): SlugAvailability {
  const formatError = slug ? getSlugError(slug) : null
  const shouldCheck = slug !== '' && slug !== currentSlug && formatError === null
  const [result, setResult] = useState<{ slug: string; free: boolean | null } | null>(null)

  useEffect(() => {
    if (!shouldCheck) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      getSlugOwner(slug).then(
        (owner) => {
          if (!cancelled) setResult({ slug, free: owner === null })
        },
        () => {
          if (!cancelled) setResult({ slug, free: null })
        },
      )
    }, CHECK_DELAY_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [slug, shouldCheck])

  if (!slug) return { status: 'idle' }
  if (slug === currentSlug) return { status: 'current' }
  if (formatError) return { status: 'invalid', message: formatError }
  if (result?.slug !== slug) return { status: 'checking' }
  if (result.free === null) return { status: 'error' }
  return result.free ? { status: 'available' } : { status: 'taken' }
}
