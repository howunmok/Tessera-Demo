import { useParams } from 'react-router'
import { PAGE_BACKGROUND } from '@/components/public/page-background'
import { PublicCardView } from '@/components/public/PublicCardView'
import { ErrorState } from '@/components/ui/ErrorState'
import { LogoMark } from '@/components/ui/Logo'
import { Skeleton } from '@/components/ui/Skeleton'
import { APP_NAME, getPublicCardUrl } from '@/config/app'
import { useAsync } from '@/hooks/useAsync'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getCardBySlug, getFirestoreErrorMessage } from '@/lib/firebase/cards'
import { describeCard } from '@/utils/card-meta'

/** The public card at /c/:slug — no sign-in, and no Firebase Auth code loaded. */
export function PublicCardPage() {
  const { slug = '' } = useParams()
  const { state, reload } = useAsync(() => getCardBySlug(slug), slug)
  const card = state.status === 'ready' ? state.data : null

  const meta = card ? describeCard(card.profile) : null
  usePageMeta({
    title: meta ? `${meta.title} · ${APP_NAME}` : `Digital business card · ${APP_NAME}`,
    description: meta?.description,
    url: card ? getPublicCardUrl(card.slug) : undefined,
    // Cards hold phone numbers and emails, so keep them out of search results.
    noindex: true,
    themeColor: PAGE_BACKGROUND[card?.theme.mode ?? 'light'],
  })

  if (state.status === 'loading') return <PublicCardSkeleton />

  if (state.status === 'error') {
    return (
      <main id="main" className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
        <ErrorState
          title="Couldn’t load this card"
          message={getFirestoreErrorMessage(state.error)}
          onRetry={reload}
        />
      </main>
    )
  }

  if (!card) return <CardNotFound />

  return <PublicCardView card={card} />
}

function PublicCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading card"
      className="min-h-dvh px-4 pt-[4.25rem]"
      style={{ backgroundColor: PAGE_BACKGROUND.light }}
    >
      <div className="mx-auto max-w-[25rem] overflow-hidden rounded-[1.75rem] bg-white shadow-card">
        <Skeleton className="h-28 rounded-none" />
        <div className="px-6 pb-7">
          <Skeleton className="-mt-12 size-24 rounded-full ring-4 ring-white" />
          <Skeleton className="mt-5 h-6 w-2/3" />
          <Skeleton className="mt-2.5 h-4 w-1/2" />
          <div className="mt-7 grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
          <Skeleton className="mt-6 h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function CardNotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="max-w-sm text-center">
        <LogoMark className="mx-auto size-10" />
        <h1 className="mt-8 font-display text-3xl font-medium tracking-tight">
          This card isn’t available
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          The link may be mistyped, or the card was renamed or removed. Ask the person who shared it
          for their latest link.
        </p>
      </div>
    </main>
  )
}
