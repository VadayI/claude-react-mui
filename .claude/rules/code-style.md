# Code style

## TypeScript / React

- TypeScript 5, `strict` on. **No `any`** (use `unknown` + narrowing); no non-null `!` to silence the compiler. Linter — **ESLint** (typescript-eslint, react, react-hooks, jsx-a11y), formatter — **Prettier**.
- Imports ordered and de-duplicated (eslint import/order). No unused imports/vars.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types, `UPPER_CASE` for constants, hooks start with `use`, event handlers `handleX`, boolean props read positively.
- **Function components only**, with hooks. No class components. Keep components small and single-purpose.
- Prefer composition over configuration; lift state only as far as needed.
- No "magic values" — colors/spacing/typography come from the theme (@.claude/rules/component-contract.md); other literals become named constants/enums.
- Secrets/config only via Vite env (`import.meta.env.VITE_*`), never hardcoded; nothing secret in `VITE_` that must stay private (all `VITE_` vars ship to the client).
- **Every exported component, hook, store, and non-trivial function has a TSDoc comment** — see *TSDoc* below.
- **Every feature has a `README.md`** at `src/features/<feature>/README.md` — see @.claude/rules/feature-readme.md.

## TSDoc (mandatory for the public surface)

Every exported component, hook, store, and public utility in `src/` carries a TSDoc block stating **why** it exists and the contract callers depend on (props/inputs, what it renders/returns, side effects, errors). Internal helpers are exempt. Tests/stories are exempt.

```ts
/**
 * Renders the todo list with loading, empty, and error states.
 *
 * Data comes from {@link useTodos}; the component is presentational and takes
 * the already-fetched view models via props so it can be tested in isolation.
 *
 * @param items - Todo view models to display (empty array → empty state).
 * @param onToggle - Called with the todo id when the user toggles completion.
 * @returns The list, or an accessible empty/error placeholder.
 */
```

Rules of thumb: first line is a single sentence; document props/params, return, and notable side effects; cross-reference with `{@link}`; for hooks describe the returned shape and when it refetches/invalidates.

## File & folder structure

- **Feature-sliced**: code is grouped by feature under `src/features/<feature>/` (`api/`, `components/`, `hooks/`, `store/`, `README.md`), not by technical type at the top level. Cross-cutting code lives in `src/lib/`, `src/components/` (shared UI), `src/app/` (routing/providers), `src/theme/`.
- One component per file; the file name matches the component (`TodoList.tsx`).
- Colocate tests (`TodoList.test.tsx`) and stories next to the component.

## File size limit (max 400 lines, enforced)

No source file in `src/` may exceed **400 lines** (React files should be small; a large component is almost always several components or a missing hook). Counted as `wc -l`. Enforced by `scripts/check_file_size.sh` in CI. Generated files (`src/lib/api/schema.d.ts`) are exempt. When a file grows: extract child components, extract a hook, or split a barrel into focused modules and re-export from `index.ts` so import paths stay stable. `code-structure-auditor` proposes the split (`/structure-audit`).

## General

- Comments explain *why*, not *what* (names + TSDoc carry *what*).
- Small functions/components with a single responsibility.
- Conventional commits (see @.claude/rules/git-operations.md).
