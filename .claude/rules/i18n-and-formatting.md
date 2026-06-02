# Internationalization & formatting (translatable, locale-correct)

Even a single-language app should be **structurally translatable** and **locale-correct** from day one — retrofitting i18n after strings are hardcoded across the tree is expensive and error-prone. This project keeps user-facing text out of components, formats dates/numbers/currency through the platform `Intl` APIs, and treats locale and direction (LTR/RTL) as first-class.

## Strings live in resources, not in JSX

- User-facing text goes through **react-i18next** (`useTranslation` / `t('key')`), with messages in `src/locales/<lng>/<namespace>.json` keyed by feature namespace. **No hardcoded display strings in components** — a literal in JSX that the user can read is a defect.
- Keys are **semantic, not English sentences** (`todos.empty.title`, not `'No todos yet'`), so copy changes don't churn keys.
- **Pluralization and interpolation** use i18next plural rules / `{{count}}` placeholders — never string concatenation (`` `${n} items` ``), which is grammatically wrong in most languages.
- Default language is configured once; a missing key falls back to the default language and is reported (i18next `saveMissing` in dev), never rendered as a raw key in production.

## Formatting through `Intl` (no manual formatting)

- Dates/times → **`Intl.DateTimeFormat`** (or the i18n layer's wrapper), numbers/percent → **`Intl.NumberFormat`**, currency → `Intl.NumberFormat` with `style: 'currency'`. **Never** hand-format with string ops or assume `MM/DD/YYYY`, a `.` decimal, or a `$` prefix.
- The **locale comes from the active language**, not the machine — formatting is deterministic and testable, not environment-dependent.
- Time zones are explicit where they matter; store/transport UTC (ISO-8601), format to the user's zone at the edge.

## Layout survives translation & direction

- Components must tolerate **text expansion** (German/Finnish run ~30–40% longer) — no fixed-width labels that clip; truncation is deliberate and has a title/tooltip.
- **RTL** is a theme concern: the MUI theme's `direction` + a `dir` attribute drive layout; use logical CSS / theme spacing, not hardcoded `left`/`right` (@.claude/rules/component-contract.md).
- Accessible names are translated too — `aria-label`/`alt` come from `t()`, not English literals (@.claude/rules/accessibility.md).

## Rules

- No user-facing literal in components — everything via `t()` with a semantic key.
- Plurals/interpolation via i18next, never string concatenation.
- All date/number/currency output via `Intl`/the i18n layer, locale-driven, never hand-rolled.
- Layout tolerates expansion and RTL; translated accessible names.

## Testing (mandatory)

Render a component under at least **two locales** (default + one other, ideally one RTL) and assert the translated text and locale-correct formatting appear (query by role/label). A test that asserts a raw English literal couples the test to copy — assert via the same `t()` key or a known translated value. Plural cases (0 / 1 / many) are triangulated. `jest-axe` clean in each locale.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares the namespaces a feature owns and any locale/RTL considerations in the contract.
- `react-developer` — wires `useTranslation`, adds keys to the resource files, formats via `Intl`; never hardcodes strings or formats by hand.
- `tester` — multi-locale render tests, plural triangulation, axe per locale.
- `reviewer` — blocks hardcoded display strings, string-concatenated plurals, manual date/number formatting, and hardcoded `left`/`right` that breaks RTL.

> Goal: the app is translatable and locale-correct by construction — text lives in resources, formatting goes through `Intl`, and layout survives other languages and RTL — so adding a language is a content task, not a refactor.
