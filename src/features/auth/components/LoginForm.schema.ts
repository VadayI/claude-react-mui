/**
 * Zod validation schema for the LoginForm.
 *
 * Single source of validation truth for the login form fields.
 * Colocated with the form; values are typed via `z.infer`.
 */
import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Required').email('Enter a valid email address.'),
  password: z.string().min(1, 'Required'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
