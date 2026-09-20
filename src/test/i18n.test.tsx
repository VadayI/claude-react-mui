/** Behavioral coverage for translated seed UI, validation, and locale formatting. */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import { createAppI18n, formatDate, formatNumber } from '../lib/i18n'
import { AddArticleForm } from '../features/articles/components/AddArticleForm'
import { ArticleList } from '../features/articles/components/ArticleList'
import { LoginForm } from '../features/auth/components/LoginForm'
import { renderWithProviders } from './renderWithProviders'
import { axe } from './setup'

describe.each(['en', 'uk'])('seed UI in %s', (language) => {
  it('translates accessible form labels and preserves submitted content', async () => {
    const i18n = createAppI18n(language)
    const onAdd = vi.fn()
    const { container } = renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <AddArticleForm onAdd={onAdd} />
      </I18nextProvider>,
    )
    const user = userEvent.setup()
    const label = language === 'uk' ? 'Назва статті' : 'Article title'
    const button = language === 'uk' ? 'Додати статтю' : 'Add Article'
    await user.type(screen.getByRole('textbox', { name: label }), '  Example  ')
    await user.click(screen.getByRole('button', { name: button }))
    expect(onAdd).toHaveBeenCalledWith('Example', '')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('translates empty state and client validation', async () => {
    const i18n = createAppI18n(language)
    const { container } = renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <ArticleList items={[]} />
        <LoginForm onSubmit={vi.fn()} isSubmitting={false} serverError={null} />
      </I18nextProvider>,
    )
    expect(screen.getByText(i18n.t('empty', { ns: 'articles' }))).toBeInTheDocument()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: i18n.t('signIn', { ns: 'auth' }) }))
    expect(await screen.findAllByText(i18n.t('required', { ns: 'auth' }))).toHaveLength(2)
    expect(await axe(container)).toHaveNoViolations()
  })

  it.each([0, 1, 2, 5])('pluralizes %i articles with locale resources', (count) => {
    const i18n = createAppI18n(language)
    const expected =
      language === 'en'
        ? `${count} ${count === 1 ? 'article' : 'articles'}`
        : `${count} ${count === 1 ? 'стаття' : count === 2 ? 'статті' : 'статей'}`
    expect(i18n.t('count', { ns: 'articles', count })).toBe(expected)
  })

  it('formats values using the selected language and an explicit time zone', () => {
    const date = '2026-09-20T23:30:00Z'
    expect(formatDate(date, language, 'UTC')).toBe(
      new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date(date),
      ),
    )
    expect(formatNumber(12345.6, language)).toBe(new Intl.NumberFormat(language).format(12345.6))
  })
})

it('falls back to English for an unsupported language', () => {
  expect(createAppI18n('zz').t('loading', { ns: 'common' })).toBe('Loading')
})
