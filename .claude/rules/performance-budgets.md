# Performance budgets (measured, gated)

A React SPA degrades silently — one stray dependency or an un-split route, and the bundle balloons while no test goes red. This project sets **explicit, enforced budgets** so performance is a number that fails CI, not a vibe. Budgets cover the **shipped bundle** and the **runtime experience** (Core Web Vitals), and are tuned per project, never invented per PR.

## The budgets (defaults — tune in `.performance-budget.json`)

- **Initial JS (gzipped, route `/`)** ≤ **180 KB**; total initial transfer ≤ **350 KB**. Each lazy route chunk ≤ **120 KB** gzipped.
- **Core Web Vitals (lab, mid-tier mobile via Lighthouse CI):** LCP ≤ **2.5 s**, CLS ≤ **0.1**, INP ≤ **200 ms**, TBT ≤ **200 ms**.
- **Lighthouse Performance score** ≥ **90** on the main screens.
- A regression > **5%** on any tracked metric fails the PR — budgets ratchet down, never silently up.

## How we stay inside them

- **Code-split at the route boundary.** Routes are `React.lazy` + `Suspense` with an accessible loading fallback (`role="status"`, @.claude/rules/component-contract.md). The shell + first route is the only synchronous JS.
- **Defer the heavy and the rare.** Charts, editors, date pickers, PDF/CSV libs, anything large or below-the-fold is dynamically imported on demand, not in the initial chunk.
- **Watch the dependency cost.** Before adding a library, check its bundle weight (bundlephobia / `vite build` diff) and prefer tree-shakeable, ESM packages; import named members, never the whole barrel (`import { x } from 'lib'`, not `import * as`). A heavy dep needs a justification in the PR.
- **MUI specifics:** rely on the central theme + `sx` (no per-render `styled()` factories in hot paths), import icons individually (`@mui/icons-material/Foo`), and let tree-shaking drop unused components — never `import * as Icons`.
- **Render cost:** memoize only where a profiler shows a real re-render problem (`React.memo`/`useMemo`/`useCallback` are not decoration); virtualize long lists; keep `useEffect` dependency arrays honest. Premature memoization is its own smell (@.claude/rules/code-style.md).
- **Assets:** images are sized/compressed and lazy (`loading="lazy"`), fonts are subset and `font-display: swap`; respect `prefers-reduced-motion` (@.claude/rules/accessibility.md).

## Enforcement (the gate)

- **`scripts/check_bundle_size.sh`** runs after `vite build`, compares gzipped chunk sizes against `.performance-budget.json`, and **exits non-zero** when a budget is exceeded. Run locally before pushing.
- **Lighthouse CI** (`lhci`) runs the CWV/score budgets against `npm run preview` in `frontend-ci.yml`; a budget breach fails the PR.
- **`reviewer`** flags un-split heavy routes, whole-barrel imports, and unjustified large dependencies; a budget breach is 🟡 Important, a core-flow LCP/INP regression is 🔴.

## Binds these agents (rule is auto-loaded)

- `ui-architect` — declares which routes are lazy-loaded and what the loading fallback is, as part of the contract.
- `react-developer` — code-splits routes, dynamically imports heavy/rare modules, keeps imports named/tree-shakeable, runs the bundle check locally.
- `react-refactoring-expert` — owns render-cost work (memoization, virtualization) under green tests, driven by profiler evidence not guesswork.
- `ci-cd-engineer` — wires `check_bundle_size.sh` + Lighthouse CI into the pipeline and keeps `.performance-budget.json` authoritative.
- `reviewer` — blocks PRs that breach a budget or add an unjustified heavy dependency.

> Goal: bundle weight and Core Web Vitals are explicit numbers checked on every build, so performance can only get better — a regression fails CI instead of shipping unnoticed.
