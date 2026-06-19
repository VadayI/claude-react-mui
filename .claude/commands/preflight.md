---
model: sonnet
---

Project kickoff preflight (hard gate): verifies the **inputs to build** are present before the first feature pipeline — brief, stack, OpenAPI contract, design references, Context7, GitHub access. The authoritative criteria live in `@.claude/rules/preflight.md`; this command executes them on demand and reports a readiness checklist. Optional `$ARGUMENTS`: a single item to re-check (`brief` | `stack` | `contract` | `design` | `context7` | `github`).

## Log

```bash
node scripts/log-cmd.mjs /preflight "$ARGUMENTS"
```

## Steps

### 1. Load the criteria

Read `@.claude/rules/preflight.md` — the checklist (items 1–6), the gate behavior (blockers = items 1, 2, 3, 5, 6; item 4 design is a recommendation), and the relation to `/doctor`. Do NOT restate the criteria here; this command runs them. If `$ARGUMENTS` names a single item, narrow to it.

### 2. Gather live state

```bash
# item 3 — contract pin + vendored schema + sync gate
grep -E '^(CONTRACT_REPO|CONTRACT_VERSION)=' .env 2>/dev/null || echo "contract vars: UNSET"
test -f src/lib/api/openapi.yml && echo "openapi.yml: present" || echo "openapi.yml: MISSING"
bash scripts/check_contract_sync.sh 2>&1 | tail -3 || true
# item 6 — GitHub access
gh auth status 2>&1 | tail -3 || echo "gh: NOT authenticated"
gh repo view --json nameWithOwner -q .nameWithOwner 2>&1 || echo "repo: UNREACHABLE"
# item 2 — stack deps
test -f package.json && echo "package.json: present" || echo "package.json: MISSING"
```

Also read (never print secrets): `docs/PROJECT.md` (brief + § Design reference + fidelity level) and `CLAUDE.md` / `README.md` (declared stack).

### 3. Delegate the judgement calls

- `devops` — access checks: Context7 reachability (item 5), GitHub auth + repo (item 6), contract availability + `check_contract_sync` (item 3), stack-deps resolvable (item 2).
- `ba` — comprehension: is the brief usable (item 1) and the stack unambiguous (item 2) enough to write user stories?
- item 4 (design): if `docs/PROJECT.md` declares a running design URL, verify it is reachable and the `playwright` plugin is enabled; declared-but-unreachable → ⚠️, fall back to folder/brief (@.claude/rules/design-reference.md).

### 4. Report the readiness checklist

```
## Preflight — <date>
1. Brief ........... ✅ / ❌   <note>
2. Stack ........... ✅ / ❌   <note>
3. Contract ........ ✅ / ❌   <note>
4. Design (rec.) ... ✅ / ⚠️   <note>
5. Context7 ........ ✅ / ❌   <note>
6. GitHub .......... ✅ / ❌   <note>
```

### 5. Gate

- Any blocker (items 1, 2, 3, 5, 6) ❌ → **STOP**: report the checklist and do NOT dispatch `ba` / the feature pipeline. Context7 may be waived only on **explicit** user override (record that APIs are unverified against current docs).
- All blockers ✅ → preflight passes; the feature pipeline may start. Item 4 ⚠️ / absent → proceed with MUI defaults, noted.

<!-- last reviewed: 2026-06-19 -->
