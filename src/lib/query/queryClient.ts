/**
 * Central TanStack Query client with project-wide defaults.
 *
 * Defaults chosen for an API-backed SPA:
 * - `staleTime` of 30 s avoids redundant refetches on quick navigations.
 * - `retry: 1` retries transient errors once but surfaces persistent ones fast.
 * - `refetchOnWindowFocus: false` keeps behaviour predictable during development.
 */
import { QueryClient } from '@tanstack/react-query'

/** Singleton QueryClient shared across the entire application. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
