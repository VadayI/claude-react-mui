/**
 * Zustand store for todos UI state.
 *
 * Holds CLIENT-ONLY state (the active filter tab). Server data (the todos list)
 * lives in TanStack Query, not here — per `.claude/rules/state-management.md`.
 */
import { create } from 'zustand'

/** The possible filter values for the todos list. */
export type TodoFilter = 'all' | 'active' | 'completed'

interface TodosUiState {
  /** Currently active filter. */
  filter: TodoFilter
  /** Update the active filter. */
  setFilter: (filter: TodoFilter) => void
}

/**
 * Zustand store for todos UI state.
 *
 * Access the filter and updater via this hook in any component.
 * No server data is stored here — this store owns only UI concerns.
 */
export const useTodosUiStore = create<TodosUiState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))

/**
 * Selector that returns just the current filter value.
 *
 * Use this instead of the whole store to prevent unnecessary re-renders.
 *
 * @param state - The full todos UI store state.
 * @returns The active `TodoFilter`.
 */
export const selectFilter = (state: TodosUiState): TodoFilter => state.filter
