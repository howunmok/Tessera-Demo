import { RotateCw } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { buttonClasses } from '@/components/ui/button-classes'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import { BASE_PATH } from '@/config/app'

/** A failed code-split import usually means a new version was deployed mid-session. */
function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
      error.message,
    )
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  const outdated = isChunkLoadError(error)

  let title = 'Something went wrong'
  let message = 'An unexpected error occurred. Please try again.'
  if (outdated) {
    title = 'A new version is available'
    message = 'Reload the page to get the latest version.'
  } else if (isRouteErrorResponse(error) && error.status === 404) {
    title = 'Page not found'
    message = 'The page you’re looking for doesn’t exist or may have moved.'
  }

  if (import.meta.env.DEV) console.error(error)

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="max-w-sm text-center">
        <LogoMark className="mx-auto size-10" />
        <h1 className="mt-8 font-display text-3xl font-medium tracking-tight">{title}</h1>
        <p className="mt-3 leading-relaxed text-muted">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              window.location.reload()
            }}
          >
            <RotateCw aria-hidden className="size-4" /> Reload
          </Button>
          {/* A plain link: the router itself may be what failed. */}
          <a href={BASE_PATH} className={buttonClasses({ variant: 'secondary' })}>
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}
