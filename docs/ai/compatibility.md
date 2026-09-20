# Pilot compatibility — measured 2026-09-20

| Capability | Observation | Status |
|---|---|---|
| Native Windows shell | PowerShell 7.6.6, explicit Git Bash 5.3.15, path containing spaces | PASS for P01 stack checks |
| Node 24.21.0 / 26.9.0 | Windows stack execution; Linux Docker Node 24 control | See P01 evidence |
| Python 3.14.7 | Seed CLI + four delivery fixtures | PASS; floor 3.13 not yet exercised |
| Claude 2.1.216 | Fresh fixture loaded CLAUDE→AGENTS, read rules.md, returned both markers; no edits | PASS for explicit rule read only |
| Codex 0.155.0-alpha.9.2 | JSONL includes actual rules.md shell read, returned both markers; no edits | PASS for explicit rule read only |
| Codex nested AGENTS | Invocation from nested cwd includes root + nested + read-rule markers | PASS for cwd-chain fixture only |
| Claude custom reviewer | Native role marker returned; init tools limited to Read/Glob/Grep; canary unchanged | PASS for fixture |
| Codex native custom role | CLI session reported custom-role selection unavailable; explicit separate-session fallback used | NOT_VERIFIED natively |
| Project skill/command | Both runtimes actually read rules.md and returned skill/rule markers | PASS for explicit invocation |
| Trusted hooks | New checkout is untrusted; global trust not changed | NOT_VERIFIED |
| Reviewer read-only enforcement | Claude tool availability + canary fixture passed; Codex native role unavailable | PARTIAL |
| K0/K1/K2 and S1–S4 | Required by P03; not yet run | NOT_VERIFIED |
| Hosted/local delivery matrix | Required by P06/P12/P13 | NOT_VERIFIED |

The observed Claude model was `claude-opus-4-8[1m]` (with a auxiliary Haiku request),
inherited from user/runtime defaults. Codex execution inherited its configuration;
model is not inferred from the app or another runtime. Claude fixture reported
0.03284 USD; Codex JSONL reported usage tokens but no price. These are tiny capability
probes, not estimates for the full pilot or evidence of context/cost savings.

Codex project adapters use the documented standalone name/description/
developer_instructions TOML schema; runtime loading still requires the probe.
Sources: [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents),
[AGENTS lookup](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
No model override, global trust, permission bypass or plugin installation is included.

## Behavioral findings (ongoing P03)

The first Claude S1 fixture was stopped after local test commands were denied in
an untrusted clone. A fresh retry grants only invocation-scoped npm/node/read-only
Git commands. This does not alter global trust. The baseline K0 native
`react-developer` did not load; its retry reads the original role explicitly.
These failures are preserved as findings, not silently counted as passing runs.

Codex file-list S1 read all 27 worker rules in bounded batches and produced actual
RED followed by 114 passing tests, typecheck/lint/build and seven article E2E
tests. Review found field mapping inline in the component despite the colocated
mapper rule. The role-pack comparison is a new checkout/session; the first
implementation is not a release or a fully passing pilot result.

S2 clean executable contract-sync returned 0; external-editor corruption of the
vendor returned 1; changing both vendor and lock digest also returned 1. The
fixture restored only its own changes. No baseline PreToolUse protection is
claimed. S4 Claude→Codex→Claude detected and corrected a stale Git handoff while
preserving the recorded CI decision. The final session explicitly distinguished
a committed fixture assertion from checks actually run in that session.

Codex S3 could not write Git objects under its workspace sandbox. A proposed
`--approve-for-me` retry was rejected by automatic approval review as broader
than the fixture; it was not executed. The runtime Git test remains NOT_VERIFIED
pending an explicit user decision. No workaround or global permission change
is part of the launcher. Independent host-controlled squash fixtures passed,
but they do not establish Codex Git execution or production G0–G9 support.
