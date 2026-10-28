import { useEffect } from 'react'
import { APP_NAME } from '@/config/app'

/** Sets the browser tab title, e.g. "Sign in · Tessera". Pass no title for the app name alone. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} — Digital business cards`
  }, [title])
}
