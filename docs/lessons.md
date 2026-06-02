# Lessons learned

Durable lessons from building this project — patterns that worked, traps to avoid. Add an entry whenever a non-obvious problem cost real time.

---

### MSW + openapi-fetch: capture `globalThis.fetch` lazily

**Context:** `openapi-fetch` reads `globalThis.fetch` at `createClient()` time. If the client module is imported before MSW patches `fetch` (e.g. via test `setupFiles`), requests bypass the mock.

**Lesson:** wrap fetch in a closure that reads the global at call time — `fetch: (...args) => globalThis.fetch(...args)` — so MSW interception always applies.

**Applies to:** the API client (`src/lib/api/client.ts`), any test that mocks the network.

---

### MUI nested-interactive vs axe

**Context:** `ListItemButton` (role=button) wrapping a `Checkbox` (role=checkbox) trips axe's `nested-interactive` rule.

**Lesson:** use a non-interactive container (`ListItem`) with a single interactive control inside, or make the row itself the only control. Run `jest-axe` on every interactive component to catch this early.

**Applies to:** list/row components, anything composing MUI interactive primitives.
