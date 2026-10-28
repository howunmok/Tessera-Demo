import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '@/components/ui/PageLoader'
import { useAuth } from '@/hooks/useAuth'
import { getRedirectTarget } from '@/utils/redirect'

/** Only signed-in users get through; everyone else is sent to sign in and brought back after. */
export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') return <PageLoader />
  if (state.status === 'signedOut') {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Sign-in pages: signed-in users skip straight to where they were going. */
export function GuestOnly() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') return <PageLoader />
  if (state.status === 'signedIn') {
    return <Navigate to={getRedirectTarget(location.state)} replace />
  }
  return <Outlet />
}
