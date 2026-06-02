# 0017. Server-state vs client-state are never blurred

Status: accepted · 2026-06-02

## Context

The most common React state bug is treating fetched data as global client state (stale copies, prop-drilling, bloated stores).

## Decision

Draw the line explicitly: **server-state** (anything fetched) → **TanStack Query** (cache, refetch, invalidation); **client-state** (UI-only: open/closed, tab, theme, draft, token) → **Zustand** (shared) or local `useState`/`useReducer`. Query keys are centralized per feature; stores hold no server data; mutations invalidate the narrowest key. Server data is never copied into a global store "to share it" — share the query.

## Consequences

- Cache-correct data layer, fewer state bugs.
- Enforced by `state-architect` and `reviewer` at the Quality Gate.
