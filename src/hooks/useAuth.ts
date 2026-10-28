import type { User } from 'firebase/auth'
import { use } from 'react'
import { AuthContext, type AuthContextValue } from '@/providers/auth-context'

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/** The signed-in user. Only call this inside routes guarded by <RequireAuth>. */
export function useCurrentUser(): User {
  const { state } = useAuth()
  if (state.status !== 'signedIn') throw new Error('useCurrentUser requires a signed-in user')
  return state.user
}
