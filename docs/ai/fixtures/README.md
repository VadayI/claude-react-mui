# Independent pilot acceptance fixtures

`S1-acceptance.test.tsx.txt` is immutable reviewer test input for the prepared
React app snapshot. Copy it to `src/test/pilotS1Acceptance.test.tsx` **only in a
disposable scenario checkout**, then run:

```text
npm run test:run -- src/test/pilotS1Acceptance.test.tsx
```

It tests actual required semantics, associated validation messages, preserved
input and focus after client/server failures in English and Ukrainian. It is
distributed as text to avoid silently adding scenario-specific tests to every
derived application. Compare the SHA-256 before/after worker corrections; do not
weaken or delete a reviewer assertion to claim that the scenario passed.

The first independent run failed 4/4 cases in K1 and 2/4 in K2. Both implementations
had previously passed their own tests. The follow-up is an explicit correction
iteration over that checkout, not a fresh independent comparison. Other S1
requirements remain covered by each scenario's behavioral tests and review.

Run `python scripts/ai/pilot_squash.py` for local-only cleanup guard fixtures. It
creates a new repository under gitignored `.ai-runtime/pilot`, simulates a squash
merge there and checks pending/dirty/active-worktree/extra-commit refusal before
deleting only its own exact-head test branch. Foreign refs and extra work remain.
It never contacts GitHub or merges an application branch. This is a fixture,
not the production G0–G9 implementation or runtime Git-permission proof.
