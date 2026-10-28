import { clsx } from 'clsx'
import { QrCode, Share, UserRoundPlus } from 'lucide-react'
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { CardRenderer } from '@/components/card/CardRenderer'
import { getCardStyle } from '@/components/card/card-style'
import { LogoMark } from '@/components/ui/Logo'
import { APP_NAME, getPublicCardUrl } from '@/config/app'
import type { Card } from '@/types/card'
import { describeCard } from '@/utils/card-meta'
import { downloadVCard } from '@/utils/vcard'
import { PAGE_BACKGROUND } from './page-background'
import { shareCard } from './share-card'

const CardQrDialog = lazy(() => import('./CardQrDialog'))

/** Show the floating "Save contact" button once the card's own buttons scroll away. */
const FLOATING_SAVE_AFTER_PX = 420

export function PublicCardView({ card }: { card: Card }) {
  const url = getPublicCardUrl(card.slug)
  const dark = card.theme.mode === 'dark'
  const name = card.profile.fullName || 'this card'
  const [qrOpen, setQrOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > FLOATING_SAVE_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function saveContact() {
    downloadVCard(card, url).catch(() => {
      toast.error('Couldn’t create the contact file. Please try again.')
    })
  }

  function share() {
    const { title } = describeCard(card.profile)
    // Many apps show only the text and link, so the text carries the name and role.
    void shareCard({ title: 'Digital business card', text: title, url })
  }

  return (
    <div
      style={{ ...getCardStyle(card.theme), backgroundColor: PAGE_BACKGROUND[card.theme.mode] }}
      className="relative min-h-dvh overflow-x-clip"
    >
      {/* A soft glow of the cover color behind the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem]"
        style={{
          background: `radial-gradient(70% 100% at 50% 0%, color-mix(in srgb, var(--card-cover) ${dark ? 45 : 28}%, transparent), transparent)`,
        }}
      />

      <header className="relative mx-auto flex max-w-[27rem] items-center justify-end gap-2 px-4 pt-4 pb-3">
        <PagePill
          dark={dark}
          onClick={() => {
            setQrOpen(true)
          }}
          label="Show QR code"
        >
          <QrCode aria-hidden className="size-4" />
        </PagePill>
        <PagePill dark={dark} onClick={share} label="Share this card">
          <Share aria-hidden className="size-4" />
          <span>Share</span>
        </PagePill>
      </header>

      <main id="main" className="relative mx-auto max-w-[27rem] px-4 pb-32">
        <h1 className="sr-only">{`${name} — digital business card`}</h1>
        <div className="animate-rise motion-reduce:animate-none">
          <CardRenderer
            content={{
              profile: card.profile,
              photo: card.photo,
              logo: card.logo,
              cover: card.cover,
              links: card.links,
              theme: card.theme,
            }}
            mode="live"
            onSaveContact={saveContact}
          />
        </div>

        <footer
          className={clsx(
            'mt-8 flex animate-rise items-center justify-center gap-2 text-xs [animation-delay:250ms] motion-reduce:animate-none',
            dark ? 'text-white/50' : 'text-ink/50',
          )}
        >
          <LogoMark className="size-4" />
          <span>Made with {APP_NAME} · Benny Creations</span>
        </footer>
      </main>

      {/* Floating "Save contact" for long cards, once the card's own button is out of view. */}
      <div
        className={clsx(
          'fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,translate] duration-300 ease-out-soft motion-reduce:transition-none',
          scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <button
          type="button"
          onClick={saveContact}
          tabIndex={scrolled ? 0 : -1}
          aria-hidden={!scrolled}
          className="flex h-12 items-center gap-2 rounded-full bg-(--card-accent) px-6 text-sm font-semibold text-(--card-on-accent) shadow-lift transition-[filter] hover:brightness-110"
        >
          <UserRoundPlus aria-hidden className="size-4.5" />
          Save contact
        </button>
      </div>

      {qrOpen && (
        <Suspense fallback={null}>
          <CardQrDialog
            card={card}
            url={url}
            onClose={() => {
              setQrOpen(false)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

function PagePill({
  dark,
  onClick,
  label,
  children,
}: {
  dark: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        'flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium shadow-xs ring-1 backdrop-blur-md transition-colors',
        dark
          ? 'bg-white/10 text-white ring-white/15 hover:bg-white/15'
          : 'bg-white/80 text-ink ring-black/5 hover:bg-white',
      )}
    >
      {children}
    </button>
  )
}
