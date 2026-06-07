# Dependencies & supply chain (minimal, locked, audited)

Every dependency is code you ship and trust — and an attack surface. Most frontend supply-chain incidents come from a compromised transitive package or an abandoned one, not from the app's own code. This project keeps the dependency tree **small, locked, and audited**, and treats adding a package as a **reviewed decision**, not a reflex.

## Lockfile is law

- The committed lockfile (`package-lock.json`) is the source of truth; CI installs with **`npm ci`** (exact, lockfile-honoring), never `npm install`. A PR that changes `package.json` without the matching lockfile change fails review.
- **No floating ranges that defeat the lock** — versions are pinned via the lockfile; the lockfile is regenerated deliberately (an upgrade PR, @.claude/rules/upgrade-policy.md), never hand-edited.
- One package manager (npm) and one lockfile — no mixed `yarn.lock`/`pnpm-lock.yaml`.

## Adding a dependency is a decision

Before adding a package, weigh and record (in the PR) the following — a heavy or risky dep needs justification:

- **Do we need it?** Prefer the platform (`Intl`, `fetch`, `URL`), an existing dep, or a few lines of our own over a new package for trivial functionality (the left-pad lesson).
- **Weight** — bundle cost checked against @.claude/rules/performance-budgets.md (bundlephobia / `vite build` diff); prefer **ESM, tree-shakeable** packages.
- **Health** — maintained (recent releases, open-issue responsiveness), reasonable transitive-dependency count, sane **license** (no copyleft surprises for a shipped SPA).
- **Trust** — popularity/provenance; be wary of typosquats and brand-new packages with one maintainer.

## Audit & integrity (gated)

- **`npm audit`** runs in CI; **high/critical** advisories fail the PR (resolve, upgrade, or record an accepted-risk exception with an expiry). Moderate/low are triaged, not ignored forever.
- **Install scripts are suspect** — avoid packages that need `postinstall` to function where possible; CI can run with `--ignore-scripts` for untrusted installs. Lockfile integrity hashes are verified by `npm ci`.
- **Dev-only stays dev-only** — build/test tooling is in `devDependencies` and must not leak into the shipped bundle.
- Secrets/tokens are never embedded in a dependency config or committed (@.claude/rules/auth.md, @.claude/rules/code-style.md).

## Rules

- `npm ci` + committed lockfile everywhere; never hand-edit the lockfile.
- A new (especially heavy/low-trust) dependency is justified in the PR; prefer platform/existing code first.
- `npm audit` high/critical blocks the PR; exceptions are explicit and time-boxed.
- Named, tree-shakeable imports only (`import { x } from 'lib'`) — ties to the performance budget.

## Binds these agents (rule is auto-loaded)

- `react-developer` — justifies new deps in the PR, keeps the lockfile in sync, imports named members only.
- `ci-cd-engineer` — wires `npm ci` + `npm audit` into `frontend-ci.yml`; keeps the audit gate authoritative.
- `security-scanner` — flags high/critical advisories, risky install scripts, typosquats, and license problems.
- `reviewer` — blocks `package.json`/lockfile mismatches, unjustified or duplicate dependencies, and dev deps leaking into the bundle.

> Goal: the dependency tree is as small as it can be, pinned by a committed lockfile, audited on every build, and every addition is a conscious, recorded choice — so a supply-chain risk is caught at the PR, not in production.
