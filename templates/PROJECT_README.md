# {PROJECT_NAME}

> React + MUI frontend for [{BACKEND}]({BACKEND_URL}).

Consumes the backend REST API contract defined in `src/lib/api/openapi.yml` (auto-pulled from the backend's OpenAPI schema endpoint). A full production backend lives in a **separate repository**; this repo is **frontend-only**.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | React 18 + Vite 8 |
| UI | MUI 6 (Material UI) |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| API types | openapi-typescript (generated) |
| Testing | Vitest + React Testing Library + MSW |
| Accessibility | jest-axe |
| E2E | Playwright |
| Lint/Format | ESLint + Prettier |

## Quick start

```bash
npm ci
cp .env.example .env          # fill VITE_API_BASE_URL (point to running backend)
npm run api:pull               # download openapi.yml from the backend
npm run api:types              # generate src/lib/api/schema.d.ts from openapi.yml
npm run dev                    # http://localhost:5173
```

## How to test

```bash
npm run test          # Vitest watch mode
npm run test:run      # single-pass (CI)
npm run test:cov      # with coverage
npm run e2e           # Playwright (needs `npm run dev` or `npm run preview` running)
npm run e2e:ui        # Playwright UI mode
```

## Lint / format / type-check

```bash
npm run lint
npm run lint:fix
npm run format
npm run typecheck
```

## Gate scripts (run before pushing)

```bash
bash scripts/check_types_drift.sh    # openapi.yml in sync with schema.d.ts
bash scripts/check_stubs.sh          # no unlogged STUB markers
bash scripts/check_file_size.sh      # no file > 400 lines
bash scripts/check_feature_readmes.sh  # every feature has README.md
```

Or run them all at once:

```bash
make gates
```

## Guides

- **User guide** — `docs/guides/user.md`
- **Developer guide** — `docs/guides/developer.md`
- **API index** — `docs/api/INDEX.md`
- **Feature list** — `src/features/` (each folder has a `README.md`)

## Environment variables

See `.env.example`. All variables are prefixed `VITE_` — they ship to the client bundle. **Never put secrets here.**

## Contributing

1. Branch off fresh `main`: `git checkout -b feat/<slug>`.
2. Run through the feature pipeline (see `docs/guides/developer.md`).
3. Open a PR — CI must be green before merge.
