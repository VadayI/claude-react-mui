/**
 * Unit tests for the LoginForm Zod schema.
 *
 * Pure schema tests — no render. Each test drives one validation path so
 * a hardcoded "always valid" result cannot stay green.
 */
import { describe, it, expect } from 'vitest'
import { loginFormSchema } from './LoginForm.schema'

describe('loginFormSchema', () => {
  it('passes for valid email and non-empty password', () => {
    const result = loginFormSchema.safeParse({ email: 'alice@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('fails with "Required" when email is empty', () => {
    const result = loginFormSchema.safeParse({ email: '', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailIssue?.message).toBe('Required')
    }
  })

  it('fails with "Enter a valid email address." when email format is invalid', () => {
    const result = loginFormSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email')
      expect(emailIssue?.message).toBe('Enter a valid email address.')
    }
  })

  it('fails with "Required" when password is empty', () => {
    const result = loginFormSchema.safeParse({ email: 'alice@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const pwIssue = result.error.issues.find((i) => i.path[0] === 'password')
      expect(pwIssue?.message).toBe('Required')
    }
  })
})
