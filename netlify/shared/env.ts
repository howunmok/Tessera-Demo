import type { FirebaseEnv } from './card-preview.ts'

/** Netlify's runtime global in edge functions. */
declare const Netlify: { env: { get: (name: string) => string | undefined } }

/**
 * The same variables the app is built with (set them under Site configuration →
 * Environment variables, with the "Functions" scope included). Null if not configured.
 */
export function readEnv(): FirebaseEnv | null {
  const get = (name: string) => Netlify.env.get(name)?.trim() || undefined
  const projectId = get('VITE_FIREBASE_PROJECT_ID')
  if (!projectId) return null
  return {
    projectId,
    apiKey: get('VITE_FIREBASE_API_KEY'),
    appName: get('VITE_APP_NAME') ?? 'Tessera',
  }
}

/** The address cards are shared on: VITE_PUBLIC_BASE_URL if set, else this site. */
export function siteBaseUrl(request: Request): string {
  const configured = Netlify.env.get('VITE_PUBLIC_BASE_URL')?.trim()
  return (configured || new URL(request.url).origin).replace(/\/+$/, '')
}
