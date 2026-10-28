import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { getPublicBaseUrl } from '@/config/app'
import { firebaseApp } from './app'

export const auth = getAuth(firebaseApp)

export async function signUpWithEmail(input: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password)
  await updateProfile(credential.user, { displayName: input.name })
  return credential.user
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

const googleProvider = new GoogleAuthProvider()
// Always show Google's account chooser, so people with several accounts can pick one.
googleProvider.setCustomParameters({ prompt: 'select_account' })

/**
 * Signs in (or signs up — it's the same step) with a Google account in a pop-up. The pop-up
 * works even when the app's domain differs from Firebase's auth domain (e.g. on Netlify),
 * where the redirect flow is blocked by browsers' third-party storage rules.
 * Resolves to null if the person closes the pop-up.
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    return credential.user
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
    ) {
      return null
    }
    throw error
  }
}

export function sendPasswordReset(email: string): Promise<void> {
  // After resetting, Firebase's hosted page offers a "Continue" link back to sign-in.
  return sendPasswordResetEmail(auth, email, { url: `${getPublicBaseUrl()}/signin` })
}

export function signOutUser(): Promise<void> {
  return signOut(auth)
}

const INVALID_CREDENTIALS =
  'That email and password don’t match. If you signed up with Google, use “Continue with Google”.'
const PROVIDER_DISABLED = import.meta.env.DEV
  ? 'This sign-in method isn’t enabled for this Firebase project yet — see docs/FIREBASE_SETUP.md, step 3.'
  : 'Sign-in is temporarily unavailable. Please try again later.'
const UNAUTHORIZED_DOMAIN = import.meta.env.DEV
  ? 'This domain isn’t authorized in Firebase Authentication yet — see docs/FIREBASE_SETUP.md, step 7.'
  : 'Sign-in isn’t available on this address yet. Please try again later.'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': INVALID_CREDENTIALS,
  'auth/invalid-login-credentials': INVALID_CREDENTIALS,
  'auth/wrong-password': INVALID_CREDENTIALS,
  'auth/user-not-found': INVALID_CREDENTIALS,
  'auth/email-already-in-use':
    'An account with this email already exists. Sign in instead — with your password, or with Google if you used it before.',
  'auth/account-exists-with-different-credential':
    'This email already has an account that uses a password. Sign in with your email and password instead.',
  'auth/popup-blocked':
    'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.',
  'auth/weak-password': 'Choose a stronger password — at least 8 characters.',
  'auth/password-does-not-meet-requirements':
    'This password doesn’t meet the password policy. Try a longer one with a mix of characters.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Enter your email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error — check your connection and try again.',
  'auth/operation-not-allowed': PROVIDER_DISABLED,
  'auth/configuration-not-found': PROVIDER_DISABLED,
  'auth/unauthorized-domain': UNAUTHORIZED_DOMAIN,
  'auth/unauthorized-continue-uri': UNAUTHORIZED_DOMAIN,
  'auth/invalid-api-key': 'The Firebase API key in .env is not valid.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'The Firebase API key in .env is not valid.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}
