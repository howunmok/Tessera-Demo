import type { User } from 'firebase/auth'
import { createContext } from 'react'

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signedOut'; user: null }
  | { status: 'signedIn'; user: User }

export interface AuthContextValue {
  state: AuthState
  /** Re-render consumers after mutating the current user (e.g. updateProfile). */
  refreshUser: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
