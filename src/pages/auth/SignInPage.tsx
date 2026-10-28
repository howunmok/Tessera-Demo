import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getAuthErrorMessage, signInWithEmail } from '@/lib/firebase/auth'
import { signInSchema } from '@/schemas/auth'
import { getFirstName } from '@/utils/text'
import { AuthLayout } from './AuthLayout'
import { AuthDivider, GoogleSignInButton } from './GoogleSignInButton'

export function SignInPage() {
  useDocumentTitle('Sign in')
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  // On success, <GuestOnly> notices the new session and redirects automatically.
  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const user = await signInWithEmail(email, password)
      const firstName = getFirstName(user.displayName)
      toast.success(firstName ? `Welcome back, ${firstName}` : 'Welcome back')
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
    }
  })

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to manage your cards."
      footer={
        <>
          New here?{' '}
          <Link
            to="/signup"
            state={location.state as unknown}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {errors.root?.message && <FormAlert className="mb-5">{errors.root.message}</FormAlert>}
      <GoogleSignInButton
        disabled={isSubmitting}
        onError={(message) => {
          if (message) setError('root', { message })
          else clearErrors('root')
        }}
      />
      <AuthDivider label="or sign in with email" />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              to="/reset-password"
              className="text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
