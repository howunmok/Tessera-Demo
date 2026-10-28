import { onAuthStateChanged } from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { auth } from '@/lib/firebase/auth'
import { AuthContext, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setState(user ? { status: 'signedIn', user } : { status: 'signedOut', user: null })
      }),
    [],
  )

  const refreshUser = useCallback(() => {
    setState((current) => (current.status === 'signedIn' ? { ...current } : current))
  }, [])

  const value = useMemo(() => ({ state, refreshUser }), [state, refreshUser])

  return <AuthContext value={value}>{children}</AuthContext>
}
