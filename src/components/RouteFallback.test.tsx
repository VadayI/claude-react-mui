/**
 * RTL tests for RouteFallback.
 *
 * RouteFallback is the accessible Suspense fallback shown while a lazy route
 * chunk loads. It must announce itself to assistive technology and be clean
 * under jest-axe.
 *
 * Tests:
 * - renders a live region (role="status") with an accessible name
 * - has no accessibility violations
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { RouteFallback } from './RouteFallback'
import { axe } from '../test/setup'

describe('RouteFallback', () => {
  it('renders a status region with an accessible name', () => {
    renderWithProviders(<RouteFallback />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveAccessibleName(/loading/i)
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<RouteFallback />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
