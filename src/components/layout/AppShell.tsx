import { clsx } from 'clsx'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useMatch, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useCurrentUser } from '@/hooks/useAuth'
import { getAuthErrorMessage, signOutUser } from '@/lib/firebase/auth'
import { getInitials } from '@/utils/text'

export function AppShell() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const displayName = user.displayName ?? user.email ?? 'Account'
  // On phones the editor pins its own toolbar and tabs, so this header scrolls away there.
  const inEditor = useMatch('/dashboard/cards/:cardId') !== null

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOutUser()
      await navigate('/signin', { replace: true })
      toast.success('You’ve been signed out')
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
      setSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={clsx(
          'top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-md print:hidden',
          inEditor ? 'lg:sticky' : 'sticky',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="rounded-lg" aria-label="Go to your cards">
            <Logo />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-brass-soft text-xs font-semibold text-brass-strong"
              >
                {getInitials(displayName)}
              </span>
              <span className="hidden max-w-48 truncate text-sm font-medium sm:block">
                {displayName}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>
              {!signingOut && <LogOut aria-hidden className="size-4" />}
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
