import { z } from './zod'

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .pipe(z.email('Enter a valid email address'))

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80, 'Keep your name under 80 characters'),
  email,
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Keep your password under 128 characters'),
})

export const resetPasswordSchema = z.object({ email })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
