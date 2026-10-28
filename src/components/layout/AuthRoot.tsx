import { Outlet } from 'react-router'
import { AuthProvider } from '@/providers/AuthProvider'

/**
 * Layout route that loads Firebase Auth. Lazy-loaded by the router so the public
 * card page (/c/:slug), which sits outside it, never downloads the Auth SDK.
 */
export function AuthRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
