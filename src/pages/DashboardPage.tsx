import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CardTile } from '@/components/dashboard/CardTile'
import { CreateCardDialog } from '@/components/dashboard/CreateCardDialog'
import { DeleteCardDialog } from '@/components/dashboard/DeleteCardDialog'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/hooks/useAsync'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getFirestoreErrorMessage, listMyCards } from '@/lib/firebase/cards'
import type { Card } from '@/types/card'
import { getFirstName } from '@/utils/text'

function getGreeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  useDocumentTitle('Your cards')
  const user = useCurrentUser()
  const firstName = getFirstName(user.displayName)
  const { state, reload, setData } = useAsync(() => listMyCards(user.uid), user.uid)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Card | null>(null)
  const hasCards = state.status === 'ready' && state.data.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Your cards</h1>
        </div>
        {hasCards && (
          <Button
            onClick={() => {
              setCreating(true)
            }}
          >
            <Plus aria-hidden className="size-4" /> New card
          </Button>
        )}
      </div>

      <div className="mt-10">
        {state.status === 'loading' && <CardGridSkeleton />}

        {state.status === 'error' && (
          <ErrorState
            title="Couldn’t load your cards"
            message={getFirestoreErrorMessage(state.error)}
            onRetry={reload}
          />
        )}

        {state.status === 'ready' && state.data.length === 0 && (
          <EmptyState
            onCreate={() => {
              setCreating(true)
            }}
          />
        )}

        {hasCards && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.data.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onDelete={() => {
                  setDeleting(card)
                }}
              />
            ))}
          </ul>
        )}
      </div>

      {creating && (
        <CreateCardDialog
          ownerUid={user.uid}
          defaultName={user.displayName ?? ''}
          email={user.email ?? ''}
          onClose={() => {
            setCreating(false)
          }}
        />
      )}

      {deleting && (
        <DeleteCardDialog
          card={deleting}
          onClose={() => {
            setDeleting(null)
          }}
          onDeleted={(cardId) => {
            setDeleting(null)
            setData((cards) => cards.filter((card) => card.id !== cardId))
          }}
        />
      )}
    </div>
  )
}

function CardGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your cards"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[0, 1, 2].map((index) => (
        <div key={index} className="overflow-hidden rounded-card border border-line bg-surface">
          <Skeleton className="h-20 rounded-none" />
          <div className="px-5 pb-5">
            <Skeleton className="-mt-8 size-16 rounded-full ring-4 ring-surface" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3.5 w-1/2" />
            <Skeleton className="mt-6 h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section
      aria-labelledby="empty-heading"
      className="flex flex-col items-center rounded-card border border-dashed border-line-strong bg-surface/70 px-6 py-16 text-center"
    >
      <div aria-hidden className="relative h-20 w-28">
        <div className="absolute top-1 left-0 h-14 w-24 -rotate-6 rounded-lg bg-ink shadow-card" />
        <div className="absolute right-0 bottom-1 flex h-14 w-24 rotate-3 flex-col justify-between rounded-lg border border-line bg-surface p-2.5 shadow-card">
          <div className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-brass" />
            <span className="h-1.5 w-10 rounded-full bg-line-strong" />
          </div>
          <div className="space-y-1">
            <span className="block h-1 w-14 rounded-full bg-line" />
            <span className="block h-1 w-10 rounded-full bg-line" />
          </div>
        </div>
      </div>

      <h2 id="empty-heading" className="mt-6 text-lg font-semibold">
        No cards yet
      </h2>
      <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
        Create a card for each role, brand or business. Add your details, pick a template, and share
        it with a QR code.
      </p>
      <Button className="mt-7" onClick={onCreate}>
        <Plus aria-hidden className="size-4" />
        Create your first card
      </Button>
    </section>
  )
}
