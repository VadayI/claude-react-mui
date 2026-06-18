# Project Brief — {PROJECT_NAME}

> This document is the authoritative project brief. It is synthesized from discovery docs and kept up to date by `/synthesize-brief`. Before the first feature pipeline, every section must be filled — `{TODO}` markers mean the brief is incomplete.

## Overview

{TODO: One or two paragraphs describing what this product is, what problem it solves, and who it is for.}

## Goals

{TODO: Numbered list of the primary goals this project must achieve. Be specific enough that "done" can be evaluated.}

1.
2.
3.

## Target users

{TODO: Who are the main user personas? What do they care about? What is their technical level?}

| Persona | Description | Key concern |
| ------- | ----------- | ----------- |
| {TODO}  | {TODO}      | {TODO}      |

## Key screens / flows

{TODO: List the main screens and the flows a user takes through them. One paragraph or bullet list per flow.}

- **{Flow name}** — {TODO: short description of the flow, start state, end state, and key actions.}

## Non-goals

{TODO: What is explicitly out of scope for this project? Prevents scope creep.}

- Not building: {TODO}
- Not responsible for: {TODO}

## Constraints

{TODO: Technical, business, regulatory, or timeline constraints that shape decisions.}

- Timeline: {TODO}
- Browser support: {TODO}
- Accessibility standard: {TODO: e.g. WCAG 2.1 AA}
- Performance budget: {TODO: e.g. LCP < 2.5s on 4G}

## Design reference

{TODO: Links to Figma files, design system docs, brand guidelines, screenshots, a Claude-design prototype folder, or a running design URL.}

| Item               | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Design source      | {TODO: none \| folder \| url \| both}                                              |
| Prototype folder   | {TODO: docs/design/<name>/ or none}                                                |
| Running design URL | {TODO: e.g. http://localhost:8331/ or none}                                        |
| Fidelity level     | {TODO: L1 measured-pixel-perfect \| L2 pixel-perfect \| L3 close-MUI (default) \| L4 inspiration} |
| Figma              | {TODO}                                                                             |
| Design system      | MUI 9 theme in `src/theme/`, derived from the design tokens                        |

> The design is always translated into the MUI theme + components and the project stack — never ported verbatim. See `@.claude/rules/design-reference.md` (incl. fidelity levels L1–L4 and live-URL inspection).

## Design deviations

{Intentional differences from the design reference, each with a reason. Sourced during `/synthesize-brief` Step 1.5 and any conflict-resolution noted by `ui-architect` / `a11y-auditor`. Accessibility and the four-state component contract win over the design and are recorded here.}

- {none recorded yet}

## Backend API

The backend is a separate repository. This frontend consumes its OpenAPI contract.

| Item                   | Value                   |
| ---------------------- | ----------------------- |
| Backend repo           | {BACKEND_REPO_URL}      |
| OpenAPI schema URL     | {OPENAPI_URL}           |
| Swagger UI             | {SWAGGER_UI_URL}        |
| Local backend base URL | `http://localhost:8000` |

The schema is pulled with `npm run api:pull` and committed as `src/lib/api/openapi.yml`. Generated TypeScript types live in `src/lib/api/schema.d.ts` (not committed — regenerated from the yml on each install).

## Open questions

{TODO: Unresolved questions that block a decision. Remove each item when resolved and record the decision in `docs/decisions/`.}

1. {TODO}
