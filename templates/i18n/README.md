# Internationalization seed

Generated files and digests come from `src/lib/i18n.ts` and `src/locales/`.
Run `python scripts/seed-i18n.py --sync` after editing the canonical seed;
`python scripts/seed-i18n.py --check` detects drift without changing files.

Fresh bootstrap: install exact i18next/react-i18next versions from the template
package manifest, then run `python scripts/seed-i18n.py --target .`.
This copies absent files and rejects conflicts before writing anything.
Existing project translations are project-owned: update through a reviewed diff,
never overwrite them with the template seed. Repeated identical seeding is a no-op.

Wrap the root in `I18nextProvider` using the exported `i18n` instance; preserve
the existing MUI and Query providers. Use `useTranslation(namespace)` for UI
and accessible labels. Import the initializer in Vitest setup. Keep namespaces
feature-owned and add actual project messages; article/auth examples are seeds.
Use `formatDate(value, i18n.resolvedLanguage ?? 'en', 'UTC')` and `formatNumber`
for explicit locale formatting. No language detector or localStorage is used.

The installer already delivers all of `templates/` and `scripts/`, including this
seed and its manifest. Python 3.13+ is the tooling prerequisite; it is not an app
runtime dependency. Apply only to the target chosen by bootstrap.
