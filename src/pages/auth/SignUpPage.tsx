import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getAuthErrorMessage, signUpWithEmail } from '@/lib/firebase/auth'
import { signUpSchema } from '@/schemas/auth'
import { getFirstName } from '@/utils/text'
import { AuthLayout } from './AuthLayout'
import { AuthDivider, GoogleSignInButton } from './GoogleSignInButton'

export function SignUpPage() {
  useDocumentTitle('Create your account')
  const location = useLocation()
  const { refreshUser } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  // On success, <GuestOnly> notices the new session and redirects automatically.
  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUpWithEmail(values)
      // The display name is saved just after the account is created; refresh so it shows.
      refreshUser()
      const firstName = getFirstName(values.name)
      toast.success(firstName ? `Welcome, ${firstName}!` : 'Welcome!', {
        description: 'Your account is ready.',
      })
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
    }
  })

  return (
    <AuthLayout
      title="Create your account"
      description="Start building your digital business card — it’s free."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/signin"
            state={location.state as unknown}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Sign in
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
      <AuthDivider label="or sign up with email" />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
