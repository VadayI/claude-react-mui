import { create } from 'zustand'

/**
 * In-memory auth store (Bearer/JWT mode).
 *
 * Access token and refresh token are held in memory ONLY — never persisted to
 * localStorage, sessionStorage, or cookies from JS (XSS-safe for the access
 * token; trade-off documented in ADR 0021).
 */
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (access: string, refresh: string) => void
  setAccessToken: (access: string) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
  setAccessToken: (access) => set({ accessToken: access }),
  clearTokens: () => set({ accessToken: null, refreshToken: null }),
}))
