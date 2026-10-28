import {
  ArrowRight,
  Check,
  Contact,
  Layers,
  Link2,
  Palette,
  Printer,
  QrCode,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { SampleCardBack, SampleCardFront } from '@/components/marketing/SampleCards'
import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { APP_NAME } from '@/config/app'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: QrCode,
    title: 'Styled QR codes',
    description:
      'Rounded dots, your brand colors and your logo in the center — tuned to scan reliably.',
  },
  {
    icon: Contact,
    title: 'One-tap Save Contact',
    description: 'Visitors download a contact card with your photo, numbers, company and links.',
  },
  {
    icon: Link2,
    title: 'Unlimited links',
    description:
      'LinkedIn, WhatsApp, WeChat, your portfolio and more — reorder them with drag and drop.',
  },
  {
    icon: Palette,
    title: 'Designer templates',
    description: 'Premium layouts, curated color palettes, font pairings, light and dark.',
  },
  {
    icon: Layers,
    title: 'A card for every role',
    description: 'Keep separate cards for your day job, your side business or each brand.',
  },
  {
    icon: Printer,
    title: 'Export and print',
    description: 'Download a PNG for your email signature, or print it at standard card size.',
  },
]

export function LandingPage() {
  useDocumentTitle()
  const { state } = useAuth()

  return (
    <div className="relative overflow-x-clip">
      {/* Soft brass glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-brass/15 blur-3xl"
      />

      <header className="relative z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Link to="/" className="rounded-lg" aria-label={`${APP_NAME} home`}>
            <Logo />
          </Link>
          <nav aria-label="Account" className="flex min-h-9 items-center gap-1.5 sm:gap-2">
            {state.status === 'signedIn' && (
              <ButtonLink to="/dashboard" size="sm">
                Your cards <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            )}
            {state.status === 'signedOut' && (
              <>
                <ButtonLink to="/signin" variant="ghost" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/signup" size="sm">
                  Get started
                </ButtonLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="relative">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-16 lg:pb-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-xs"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-brass" />
              Digital business cards
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-[2.75rem] leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]"
            >
              One card. <em className="text-brass-strong">Every</em> first impression.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted"
            >
              Design a polished digital business card, share it with a styled QR code, and let
              people save your contact in a single tap — no app required.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
              {state.status === 'signedIn' ? (
                <ButtonLink to="/dashboard" size="lg">
                  Go to your cards <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to="/signup" size="lg">
                    Create your card <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink to="/signin" variant="secondary" size="lg">
                    Sign in
                  </ButtonLink>
                </>
              )}
            </motion.div>
            <motion.ul
              variants={fadeUp}
              className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            >
              {['Free to use', 'Works on any phone', 'No app to install'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden className="size-4 text-brass-strong" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <HeroVisual />
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section aria-labelledby="features-heading" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="text-sm font-semibold text-brass-strong">Everything in one place</p>
            <h2
              id="features-heading"
              className="mt-3 max-w-2xl font-display text-4xl leading-[1.1] font-medium tracking-tight text-balance sm:text-5xl"
            >
              A business card that works as hard as you do.
            </h2>
            <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="bg-surface p-7 sm:p-8">
                  <span className="grid size-10 place-items-center rounded-xl bg-brass-soft text-brass-strong">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Call to action ───────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brass/25 blur-3xl"
            />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl leading-tight font-medium tracking-tight text-balance text-white sm:text-5xl">
              Make your next introduction unforgettable.
            </h2>
            <p className="relative mt-4 text-white/70">Your first card takes about two minutes.</p>
            <ButtonLink
              to={state.status === 'signedIn' ? '/dashboard' : '/signup'}
              variant="inverse"
              size="lg"
              className="relative mt-8"
            >
              {state.status === 'signedIn' ? 'Go to your cards' : 'Create your card'}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {APP_NAME}
          </p>
          <p>Made for lasting first impressions.</p>
        </div>
      </footer>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto grid h-[19rem] w-full max-w-md place-items-center sm:h-[24rem]">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: -7 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        className="absolute -translate-x-6 -translate-y-14 sm:-translate-x-10 sm:-translate-y-16"
      >
        <SampleCardBack />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 32, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        className="absolute translate-x-6 translate-y-12 sm:translate-x-10 sm:translate-y-14"
      >
        <SampleCardFront />
      </motion.div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9, ease: EASE }}
        className="absolute right-0 bottom-0 flex items-center gap-2 rounded-full border border-line bg-surface py-2 pr-4 pl-2 text-sm font-medium shadow-card sm:-right-4"
      >
        <span className="grid size-6 place-items-center rounded-full bg-success text-white">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        Contact saved
      </motion.div>
    </div>
  )
}
