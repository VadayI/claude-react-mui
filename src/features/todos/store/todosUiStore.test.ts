/**
 * Unit tests for the todos UI Zustand store.
 *
 * Tests that the store initialises correctly and that state transitions
 * work as expected. Triangulation: we test three distinct filter values
 * to ensure the store doesn't hardcode a single state.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useTodosUiStore, selectFilter } from './todosUiStore'

describe('todosUiStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useTodosUiStore.setState({ filter: 'all' })
  })

  it('initialises with filter = "all"', () => {
    const filter = useTodosUiStore.getState().filter
    expect(filter).toBe('all')
  })

  it('setFilter transitions to "active"', () => {
    useTodosUiStore.getState().setFilter('active')
    expect(useTodosUiStore.getState().filter).toBe('active')
  })

  it('setFilter transitions to "completed"', () => {
    useTodosUiStore.getState().setFilter('completed')
    expect(useTodosUiStore.getState().filter).toBe('completed')
  })

  it('setFilter transitions back to "all"', () => {
    useTodosUiStore.getState().setFilter('completed')
    useTodosUiStore.getState().setFilter('all')
    expect(useTodosUiStore.getState().filter).toBe('all')
  })

  it('selectFilter selector returns the current filter', () => {
    useTodosUiStore.getState().setFilter('active')
    const state = useTodosUiStore.getState()
    expect(selectFilter(state)).toBe('active')
  })
})
