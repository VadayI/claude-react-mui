# Pilot compatibility — measured 2026-09-20

| Capability | Observation | Status |
|---|---|---|
| Native Windows shell | PowerShell 7.6.6, explicit Git Bash 5.3.15, path containing spaces | PASS for P01 stack checks |
| Node 24.21.0 / 26.9.0 | Windows stack execution; Linux Docker Node 24 control | See P01 evidence |
| Python 3.14.7 | Seed CLI + four delivery fixtures | PASS; floor 3.13 not yet exercised |
| Claude 2.1.216 | Fresh fixture loaded CLAUDE→AGENTS, read rules.md, returned both markers; no edits | PASS for explicit rule read only |
| Codex 0.155.0-alpha.9.2 | JSONL includes actual rules.md shell read, returned both markers; no edits | PASS for explicit rule read only |
| Codex nested AGENTS | Invocation from nested cwd includes root + nested + read-rule markers | PASS for cwd-chain fixture only |
| Custom role, skill, trusted hook | Adapters prepared; behavioral fixtures pending | NOT_VERIFIED |
| Reviewer read-only enforcement | Configuration is not yet behavioral evidence | NOT_VERIFIED |
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
