import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="max-w-sm text-center">
        <LogoMark className="mx-auto size-10" />
        <p className="mt-8 text-sm font-semibold text-brass-strong">404</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Page not found</h1>
        <p className="mt-3 leading-relaxed text-muted">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <ButtonLink to="/" variant="secondary" className="mt-8">
          <ArrowLeft aria-hidden className="size-4" /> Back to home
        </ButtonLink>
      </div>
    </main>
  )
}
