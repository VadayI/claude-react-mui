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

### Edit/Write tools truncate files on this mount — write via bash heredoc

**Context:** on the Windows-drive mount (`/mnt/d/...` ↔ `D:\...`), the Edit/Write file tools **silently truncate** files — the file ends mid-word, with no trailing newline, losing its tail. Confirmed repeatedly: `CLAUDE.md`, `docs/WORKLOG.md`, and `.github/workflows/frontend-ci.yml` were each truncated this way. Likely a byte-vs-character length mismatch around multibyte UTF-8 (`→`, `·`, `—`), aggravated by `index.lock` contention with VS Code.

**Lesson:** never use Edit/Write on files under this mount. Write everything via **bash heredoc / redirection** (`cat > file <<'EOF' … EOF`) — proven reliable. After any write, re-check integrity: no NUL bytes, a trailing newline present (the `scripts/check_truncation.sh` gate, once added, automates this).

**Applies to:** every file write to `.claude/**`, `docs/**`, and the repo root on this mount; doubly so for files containing multibyte characters.
