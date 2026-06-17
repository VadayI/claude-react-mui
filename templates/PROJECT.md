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

## Design references

{TODO: Links to Figma files, design system docs, brand guidelines, or screenshots.}

- Figma: {TODO}
- Design system: MUI 9 default theme, customized in `src/theme/`

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
