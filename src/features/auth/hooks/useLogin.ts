/**
 * useLogin mutation hook.
 *
 * Wraps the POST /api/v1/auth/login endpoint via the typed API client.
 * Returns a TanStack Query mutation object.
 *
 * @returns TanStack Query useMutation result for the login operation.
 */
import { useMutation } from '@tanstack/react-query'
import { apiClient, normaliseError } from '../../../lib/api/client'
import type { components } from '../../../lib/api/schema.d.ts'

type LoginRequest = components['schemas']['LoginRequest']
type TokenPair = components['schemas']['TokenPair']

async function loginRequest(credentials: LoginRequest): Promise<TokenPair> {
  const { data, error } = await apiClient.POST('/api/v1/auth/login', {
    body: credentials,
  })
  if (error) {
    throw normaliseError(error, 'Login failed')
  }
  return data
}

export function useLogin() {
  return useMutation<TokenPair, Error, LoginRequest>({
    mutationFn: loginRequest,
  })
}
