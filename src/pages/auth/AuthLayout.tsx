import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SampleCardBack, SampleCardFront } from '@/components/marketing/SampleCards'
import { Logo } from '@/components/ui/Logo'
import { APP_NAME } from '@/config/app'

interface AuthLayoutProps {
  title: string
  description: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Link to="/" className="self-start rounded-lg" aria-label={`${APP_NAME} home`}>
          <Logo />
        </Link>

        <main
          id="main"
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12"
        >
          <h1 className="font-display text-4xl font-medium tracking-tight">{title}</h1>
          <p className="mt-2.5 leading-relaxed text-muted">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </main>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      <BrandPanel />
    </div>
  )
}

function BrandPanel() {
  return (
    <aside
      aria-hidden
      className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-brass/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 size-[22rem] rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid flex-1 place-items-center">
        <div className="relative h-80 w-full max-w-md">
          <div className="absolute top-0 left-0 -rotate-6 opacity-90">
            <SampleCardBack className="border border-white/10" />
          </div>
          <div className="absolute right-0 bottom-0 rotate-3">
            <SampleCardFront />
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="font-display text-3xl leading-snug font-medium tracking-tight">
          Share who you are in a single scan.
        </p>
        <ul className="mt-6 space-y-2.5 text-sm text-white/70">
          {[
            'Styled QR codes that match your brand',
            'One-tap Save Contact on any phone',
            'Separate cards for every role',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Check className="size-4 text-brass" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
