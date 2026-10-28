import type { FirebaseOptions } from 'firebase/app'

const env = import.meta.env

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function read(value: string | undefined): string | undefined {
  return value?.trim() || undefined
}

/** Names of required Firebase variables that are missing from `.env` (empty when configured). */
export const missingFirebaseEnv: string[] = REQUIRED_KEYS.filter((key) => !read(env[key]))

export function getFirebaseOptions(): FirebaseOptions {
  if (missingFirebaseEnv.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missingFirebaseEnv.join(', ')}`)
  }

  return {
    apiKey: read(env.VITE_FIREBASE_API_KEY),
    authDomain: read(env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: read(env.VITE_FIREBASE_PROJECT_ID),
    appId: read(env.VITE_FIREBASE_APP_ID),
    storageBucket: read(env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: read(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  }
}
