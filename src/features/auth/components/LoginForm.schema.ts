/**
 * Zod validation schema for the LoginForm.
 *
 * Single source of validation truth for the login form fields.
 * Colocated with the form; values are typed via `z.infer`.
 */
import { z } from 'zod'
import type { TFunction } from 'i18next'
import { i18n } from '../../../lib/i18n'

/**
 * Builds client validation messages for the currently rendered locale.
 * @param t - Auth namespace translator from the component's i18next instance.
 * @returns A Zod schema; no I/O, DB access, mutations, or expected exceptions.
 * Required and invalid-email rules remain unchanged across languages.
 */
export function createLoginFormSchema(t: TFunction<'auth'>) {
  return z.object({
    email: z.string().min(1, t('required')).email(t('invalidEmail')),
    password: z.string().min(1, t('required')),
  })
}

export const loginFormSchema = createLoginFormSchema(i18n.getFixedT('en', 'auth'))

export type LoginFormValues = z.infer<typeof loginFormSchema>
