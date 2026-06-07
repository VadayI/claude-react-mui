---
name: zustand-state
description: Zustand 5 — typed stores, narrow selectors, slices, persist middleware, testing — activate for client-side global UI state.
---

# Zustand 5 Client State

Reference: `@.claude/rules/state-management.md`

## Core principle

Zustand owns **client/UI state** only (sidebar open, active filters, notification queue, theme preference).
Never put server data (fetched from API) in Zustand — that belongs in TanStack Query.

## Typed store

```ts
// src/store/uiStore.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeDialog: string | null
  openSidebar: () => void
  closeSidebar: () => void
  openDialog: (name: string) => void
  closeDialog: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeDialog: null,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  openDialog: (name) => set({ activeDialog: name }),
  closeDialog: () => set({ activeDialog: null }),
}))
```

## Narrow selectors — avoid unnecessary re-renders

```tsx
// Bad: subscribes to the whole store — re-renders on any change
const store = useUIStore()

// Good: subscribe only to what you need
const sidebarOpen = useUIStore((s) => s.sidebarOpen)
const openSidebar = useUIStore((s) => s.openSidebar)
```

## Slices pattern for large stores

```ts
// src/store/slices/notificationsSlice.ts
import type { StateCreator } from 'zustand'

export interface NotificationsSlice {
  notifications: Notification[]
  addNotification: (n: Notification) => void
  removeNotification: (id: string) => void
}

export const createNotificationsSlice: StateCreator<NotificationsSlice> = (set) => ({
  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
})

// src/store/rootStore.ts
export const useRootStore = create<UISlice & NotificationsSlice>()((...a) => ({
  ...createUISlice(...a),
  ...createNotificationsSlice(...a),
}))
```

## Persist middleware — allowlist only safe fields

```ts
import { persist, createJSONStorage } from 'zustand/middleware'

// Never persist tokens, PII, or sensitive data
export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      colorMode: 'light' as 'light' | 'dark',
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    {
      name: 'user-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ colorMode: state.colorMode }), // allowlist
    },
  ),
)
```

## Testing stores

```ts
// Reset store state between tests
import { useUIStore } from '@/store/uiStore'

beforeEach(() => {
  useUIStore.setState({ sidebarOpen: false, activeDialog: null })
})

it('openSidebar sets sidebarOpen to true', () => {
  useUIStore.getState().openSidebar()
  expect(useUIStore.getState().sidebarOpen).toBe(true)
})
```

<!-- last reviewed: 2026-06-02 -->
