# P03 evidence index — in progress

This report is an intermediate result, not pilot acceptance or family completion.
App snapshot: `9581f9c463e7225eb9e3427d2b98f6e41c70e57d`.
Instruction candidate K1/K2: `212036d83b763cc4642476afce1aca6d28157806`.
K0 retains the original prepared-app instructions. Optional plugin activation is
disabled equally for fixture safety; no real secrets/untracked source work is
copied. Each independent run has its own checkout and no session history.

| Scenario | Evidence so far | Acceptance |
| --- | --- | --- |
| S1 K0 | Native role missing; explicit-role retry, then command-permission retry | Running |
| S1 K1 | Pack retry actually delivered all 27 sources; 118 tests/typecheck/lint pass; independent seed drift check fails | Correction required |
| S1 K2 file-list | 27 rules read; behavioral RED, 114 tests and 7 E2E pass; inline mapper review finding | Needs correction/comparison |
| S1 K2 pack | Independent comparison checkout/session | Running |
| S2 K0/K1/K2 | All three fresh policy sessions completed; executable clean/corrupt/vendor+lock checks return 0/1/1 | Policy reports under review |
| S3 K0 | Commit contains only task changes; foreign refs/stash preserved, but real index retains staged task reversions and unrelated post-session formatting changes exist | FAIL |
| S3 K1 | Same ownership fixture | Running |
| S3 K2 | Git object writes denied; no commit/push falsely claimed | NOT_VERIFIED |
| S3 squash harness | Pending PR, dirty tree, active branch, extra commits refused; own exact-head cleanup and foreign-ref preservation pass | Local fixture PASS only |
| S4 | Three fresh sessions, Git-only memory; stale version/revision detected and reconciled; decision preserved | PASS for fixture |

The disposable Git scenario explicitly narrows work to fixture-owned docs and
reports app release checks NOT_VERIFIED. It does not grant permission to publish
an unverified real application. Its only remote is a local bare repository.
The squash harness is separate from the runtime sessions and is not represented
as a completed production Git lifecycle implementation.

Raw transcripts, per-run metadata, diffs and gate reports are retained in the
operator's `.implementation/2026-09-20/` workspace. They are not committed as
project memory or distributed in templates. Final acceptance must record
sanitized command/result summaries, instruction digests, actual read coverage,
violations and available usage metrics. Missing timing/model/cost metrics will
remain unavailable; file size is never used as a token/cost estimate.

P01 is separately published as [PR #68](https://github.com/VadayI/claude-react-mui/pull/68).
Its exact head passed hosted Quality Gates and E2E in run 35518018036. No merge
has occurred; later pilot commits are not included in that PR.

## Corrections from measured findings

- Pack receipt self-reported 26 sources in K1; transcript analysis found all 27
  distinct END SOURCE markers and final END ROLE PACK. The report count was wrong;
  actual read coverage is complete.
- K1 S1 application tests passed, but independent `seed-i18n.py --check` returned 1.
  The i18n rule now explicitly requires seed synchronization and read-only drift
  verification whenever canonical resources change. This repair still needs its
  affected runtime follow-up, not a claim that the first run passed.
- K0 S3 left its task content staged for reversal and a new committed file staged
  for deletion. The cached foreign patch itself and stash/foreign refs survived.
  This is a state defect, not the cosmetic artifact claimed by that session.
  Unrelated formatting diffs were also present after session completion; K0 retains
  its old project-wide Stop fixers. The K1/K2 candidate removes those fixers.
- Wrap-up now explicitly requires reconciling committed task hunks into the real
  index while preserving the exact foreign staged/unstaged distinction.
