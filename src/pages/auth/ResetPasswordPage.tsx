import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getAuthErrorMessage, sendPasswordReset } from '@/lib/firebase/auth'
import { resetPasswordSchema } from '@/schemas/auth'
import { AuthLayout } from './AuthLayout'

export function ResetPasswordPage() {
  useDocumentTitle('Reset password')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await sendPasswordReset(email)
      setSentTo(email)
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
    }
  })

  const backToSignIn = (
    <Link
      to="/signin"
      className="inline-flex items-center gap-1.5 font-medium text-ink underline-offset-4 hover:underline"
    >
      <ArrowLeft aria-hidden className="size-4" /> Back to sign in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your inbox"
        description="Follow the link in the email to choose a new password."
      >
        <FormAlert tone="success">
          If an account exists for <strong className="font-semibold">{sentTo}</strong>, a reset link
          is on its way. It can take a minute — check your spam folder too.
        </FormAlert>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/signin" size="lg">
            Back to sign in
          </ButtonLink>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setSentTo(null)
            }}
          >
            Use a different email
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email you signed up with and we’ll send you a reset link."
      footer={backToSignIn}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {errors.root?.message && <FormAlert>{errors.root.message}</FormAlert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  )
}
