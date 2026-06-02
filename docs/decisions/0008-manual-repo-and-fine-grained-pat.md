# 0008. Manual repo creation + fine-grained PAT

Status: accepted · 2026-06-02

## Context

Automating repo creation hides permission setup and encourages over-broad tokens.

## Decision

The GitHub repository is created **by hand**; access is a **fine-grained per-repo PAT** with Contents RW, Metadata RO, Pull requests RW, Workflows RW, Administration RW (for branch protection). Fine-grained tokens carry no OAuth scopes, so empty `scopes` is expected; capability is verified by `gh repo view`. `GITHUB_PERSONAL_ACCESS_TOKEN` is required for `gh` even when the github MCP is used.

## Consequences

- Least-privilege, per-repo access.
- `/doctor` checks reachability, not scope strings.
