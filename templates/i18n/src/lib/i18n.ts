/** Bundled, deterministic translations: no network, storage, or language detection. */
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '../locales/en/common.json'
import ukCommon from '../locales/uk/common.json'
import enAuth from '../locales/en/auth.json'
import enArticles from '../locales/en/articles.json'
import ukAuth from '../locales/uk/auth.json'
import ukArticles from '../locales/uk/articles.json'

/**
 * Creates a synchronously initialized, independent translation instance.
 * @param language - Requested BCP 47 language; unsupported values fall back to English.
 * @returns An i18next instance with common, auth, and articles resources.
 * Registers the React plugin; performs no I/O and accesses no database or storage.
 */
export function createAppI18n(language = 'en') {
  const instance = createInstance()
  void instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'articles'],
    resources: {
      en: { common: enCommon, auth: enAuth, articles: enArticles },
      uk: { common: ukCommon, auth: ukAuth, articles: ukArticles },
    },
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (_languages, namespace, key) => {
      console.warn(`[i18n] Missing translation: ${namespace}:${key}`)
    },
  })
  return instance
}

export const i18n = createAppI18n()

/**
 * Formats an ISO date using the active language and an explicit time zone.
 * @param value - ISO date/time string from the API.
 * @param language - Active i18next language, independent of the machine locale.
 * @param timeZone - IANA zone; defaults to UTC for deterministic seed output.
 * @returns A localized medium date. No I/O or mutations.
 * @throws RangeError for an invalid date, locale, or time zone.
 */
export function formatDate(value: string, language: string, timeZone = 'UTC'): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone }).format(
    new Date(value),
  )
}

/**
 * Formats a number with the active language, without machine-locale assumptions.
 * @param value - Numeric value to display.
 * @param language - Active BCP 47 language.
 * @returns Localized decimal text. No I/O or mutations.
 * @throws RangeError for an invalid locale.
 */
export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language).format(value)
}
