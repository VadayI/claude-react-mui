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

---

### The mount also blocks `unlink` and corrupts binary writes (not just text truncation)

**Context:** extending the known Edit/Write truncation lesson. On the Windows-drive FUSE mount, a full characterization showed three distinct failure modes: (1) **text writes** truncate / NUL-pad the tail; (2) **binary writes** are corrupted byte-for-byte — a valid `.git/index` rebuilt in `/tmp` came back with 16771 differing bytes after `cp` onto the mount ("index uses ? extension"); (3) **`unlink`/`rm` is blocked entirely** (EPERM) for every file including freshly created ones, and git cannot create `index.lock`.

**Lesson:** what the mount *can* do reliably is **create new files** and **overwrite existing text files in place** (`cp` / `>`), plus **rename to a new name**. It **cannot** delete files, replace files via rename-over-existing, write binary blobs, or run git ops that take an index lock (commit/add/rm/reset, index rebuild). Do those on the **native Windows shell**. Recovering a broken repo: `.git/HEAD` (tiny ASCII) is safe to rewrite from the sandbox; `.git/index` must be rebuilt natively (`del .git\index && git reset`).

**Applies to:** any file deletion, git index/commit operations, and any binary file under the mount.
