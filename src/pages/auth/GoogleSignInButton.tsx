import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'
import { getAuthErrorMessage, signInWithGoogle } from '@/lib/firebase/auth'
import { getFirstName } from '@/utils/text'

/**
 * "Continue with Google" — the same button signs people in and signs them up.
 * On success, <GuestOnly> sees the new session and redirects automatically.
 */
export function GoogleSignInButton({
  onError,
  disabled = false,
}: {
  onError: (message: string | null) => void
  disabled?: boolean
}) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    onError(null)
    try {
      const user = await signInWithGoogle()
      if (user) {
        const firstName = getFirstName(user.displayName)
        toast.success(firstName ? `Welcome, ${firstName}` : 'Welcome')
      }
    } catch (error) {
      onError(getAuthErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line-strong bg-surface text-[0.9375rem] font-medium text-ink shadow-xs transition-[background-color,border-color] duration-200 hover:border-ink/25 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-60"
    >
      {busy ? (
        <LoaderCircle aria-hidden className="size-5 animate-spin text-muted" />
      ) : (
        <FcGoogle aria-hidden className="size-5" />
      )}
      Continue with Google
    </button>
  )
}

/** "or" divider between the Google button and the email form. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium tracking-wide text-muted uppercase">
      <span aria-hidden className="h-px flex-1 bg-line" />
      {label}
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  )
}
