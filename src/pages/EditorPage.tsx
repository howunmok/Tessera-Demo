import { ArrowLeft } from 'lucide-react'
import { useParams } from 'react-router'
import { CardEditor } from '@/components/editor/CardEditor'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getCard, getFirestoreErrorMessage } from '@/lib/firebase/cards'

export function EditorPage() {
  const { cardId = '' } = useParams()
  const user = useCurrentUser()
  const { state, reload } = useAsync(() => getCard(cardId), cardId)

  const card = state.status === 'ready' ? state.data : null
  const ownCard = card?.ownerUid === user.uid ? card : null
  useDocumentTitle(
    ownCard ? `Edit ${ownCard.label || ownCard.profile.fullName || 'card'}` : 'Edit card',
  )

  if (state.status === 'loading') return <EditorSkeleton />

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <ErrorState
          title="Couldn’t load this card"
          message={getFirestoreErrorMessage(state.error)}
          onRetry={reload}
        />
      </div>
    )
  }

  if (!ownCard) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">Card not found</h1>
        <p className="mt-3 text-muted">
          It may have been deleted, or it belongs to another account.
        </p>
        <ButtonLink to="/dashboard" variant="secondary" className="mt-8">
          <ArrowLeft aria-hidden className="size-4" /> Back to your cards
        </ButtonLink>
      </div>
    )
  }

  return <CardEditor key={ownCard.id} initialCard={ownCard} />
}

function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading card" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="h-6 w-48" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] xl:gap-12">
        <div className="space-y-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-4 rounded-card border border-line bg-surface p-7">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="hidden h-[34rem] rounded-[2rem] lg:block" />
      </div>
    </div>
  )
}
