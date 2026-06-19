---
model: sonnet
argument-hint: "[path]"
---

Audit `src/` against the 400-line file size limit and propose folder/module splits. Read-only — no files are changed. Delegates to `code-structure-auditor`.

## Log

```bash
node scripts/log-cmd.mjs /structure-audit "$ARGUMENTS"
```

## Steps

### 1. Run the gate script

```bash
bash scripts/check_file_size.sh
```

This reports all non-test TypeScript/TSX files over 400 lines. Capture the output.

### 2. Full audit pass

If `$ARGUMENTS` specifies a path, scope to that directory. Otherwise audit all of `src/`.

Delegate to `code-structure-auditor` with:

- The gate script output.
- The full file tree of `src/`.
- The architecture rules from `@.claude/rules/architecture.md`.

Audit criteria:

- **Hard limit**: any `.ts` / `.tsx` file over 400 lines (excluding auto-generated files like `src/lib/api/schema.d.ts`).
- **Approaching limit**: files between 300-400 lines — flag as ⚠️.
- **Responsibility cohesion**: does each file have a single clear responsibility? Flag files that mix concerns (e.g., a component file that also contains business logic, API calls, and local state management).
- **Feature structure**: each `src/features/<name>/` should have a `README.md`. Flag missing ones.

### 3. Propose splits

For each file over the limit, `code-structure-auditor` proposes a concrete split plan — NOT an execution. Example:

```
src/features/billing/BillingPage.tsx (520 lines)
  → src/features/billing/components/InvoiceTable.tsx  (extraction)
  → src/features/billing/components/PaymentForm.tsx   (extraction)
  → src/features/billing/BillingPage.tsx              (~120 lines, orchestrator only)
```

Splits must follow responsibility seams, not line counts. Keep public import paths stable via `index.ts` re-exports.

### 4. Report

Print a prioritized list:

- 🔴 Over limit — must split (blocks CI gate).
- 🟡 Approaching limit — should split soon.
- 🟢 Responsibility concern — consider splitting.

This is a read-only audit. To execute a split, the user should run the feature pipeline with `react-refactoring-expert` dispatched in GREEN phase.

<!-- last reviewed: 2026-06-02 -->
