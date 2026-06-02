/**
 * Unit tests for TodoList presentational component.
 *
 * TDD cycle: tests written first (RED), then TodoList built GREEN.
 * Triangulation: empty, single-item, and multiple-item states tested to ensure
 * the component handles all cases rather than hardcoding a single scenario.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '../../../test/setup'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { TodoList } from './TodoList'
import { makeTodo } from '../../../test/factories/todo'

describe('TodoList', () => {
  describe('empty state', () => {
    it('shows an empty-state message when items is empty', () => {
      renderWithProviders(<TodoList items={[]} onToggle={vi.fn()} />)
      expect(screen.getByTestId('todo-empty-message')).toBeInTheDocument()
      expect(screen.getByTestId('todo-empty-message')).toHaveTextContent(/no todos yet/i)
    })

    it('does not render a list when items is empty', () => {
      renderWithProviders(<TodoList items={[]} onToggle={vi.fn()} />)
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('single item', () => {
    it('renders the todo title', () => {
      const todo = makeTodo({ title: 'Buy milk' })
      renderWithProviders(<TodoList items={[todo]} onToggle={vi.fn()} />)
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('renders an unchecked checkbox for an incomplete todo', () => {
      const todo = makeTodo({ completed: false })
      renderWithProviders(<TodoList items={[todo]} onToggle={vi.fn()} />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).not.toBeChecked()
    })

    it('renders a checked checkbox for a completed todo', () => {
      const todo = makeTodo({ completed: true })
      renderWithProviders(<TodoList items={[todo]} onToggle={vi.fn()} />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
    })
  })

  describe('multiple items', () => {
    it('renders all provided todos', () => {
      const todos = [
        makeTodo({ title: 'First task' }),
        makeTodo({ title: 'Second task' }),
        makeTodo({ title: 'Third task' }),
      ]
      renderWithProviders(<TodoList items={todos} onToggle={vi.fn()} />)
      expect(screen.getByText('First task')).toBeInTheDocument()
      expect(screen.getByText('Second task')).toBeInTheDocument()
      expect(screen.getByText('Third task')).toBeInTheDocument()
    })

    it('renders the correct number of checkboxes', () => {
      const todos = [makeTodo(), makeTodo(), makeTodo()]
      renderWithProviders(<TodoList items={todos} onToggle={vi.fn()} />)
      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    })
  })

  describe('interaction', () => {
    it('calls onToggle with the todo id when the list item is clicked', async () => {
      const user = userEvent.setup()
      const todo = makeTodo({ id: 42, title: 'Click me' })
      const onToggle = vi.fn()
      renderWithProviders(<TodoList items={[todo]} onToggle={onToggle} />)

      // Click the list item button (wraps the checkbox)
      await user.click(screen.getByText('Click me'))
      expect(onToggle).toHaveBeenCalledOnce()
      expect(onToggle).toHaveBeenCalledWith(42)
    })

    it('calls onToggle with the correct id for each of multiple todos', async () => {
      const user = userEvent.setup()
      const todos = [
        makeTodo({ id: 10, title: 'First' }),
        makeTodo({ id: 20, title: 'Second' }),
      ]
      const onToggle = vi.fn()
      renderWithProviders(<TodoList items={todos} onToggle={onToggle} />)

      await user.click(screen.getByText('Second'))
      expect(onToggle).toHaveBeenCalledWith(20)
    })
  })

  describe('accessibility', () => {
    it('has no axe violations when empty', async () => {
      const { container } = renderWithProviders(
        <TodoList items={[]} onToggle={vi.fn()} />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with items', async () => {
      const todos = [
        makeTodo({ title: 'Accessible todo 1', id: 101 }),
        makeTodo({ title: 'Accessible todo 2', id: 102, completed: true }),
      ]
      const { container } = renderWithProviders(
        <TodoList items={todos} onToggle={vi.fn()} />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
