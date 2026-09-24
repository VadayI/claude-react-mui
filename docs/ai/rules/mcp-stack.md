# Optional MCP and equivalent capabilities

The common workflow has no direct dependency on a Claude marketplace or a named
plugin. Use installed authorized tools, CLI or official documentation as available.
Never install plugins, activate duplicate servers or modify global trust merely
to satisfy a template recommendation. Project files cannot grant themselves trust.

| Capability | Optional implementation | Equivalent |
| --- | --- | --- |
| PR read/create/review | GitHub MCP | gh pr / gh api |
| CI logs/status | GitHub tools | gh run / gh pr checks |
| Current library docs | Context7 resolve-library-id + query-docs | Official documentation |
| Running design inspection | Playwright MCP | Available browser automation |
| Application E2E | Playwright test runner | Run the committed E2E suite |

Use actual discovered tool names; do not copy runtime-specific names into another
runtime. Report a missing capability as NOT_VERIFIED when no equivalent exists.
Browser design inspection is read-only, including localhost. Record references
in docs/PROJECT.md. Inspect accessibility, screenshots and computed styles as
needed for the requested fidelity; do not mutate the reference design. Browser
inspection does not substitute for the application's E2E runner.

Review third-party server/skill executables, privileges and data access before
an authorized installation. Secrets belong only to the user's credential system
or authorized environment; never read, copy, print or commit them. Do not bypass
blocked fetches with curl/scripts. Posting reviews/comments still requires the
user's authorization for that communication.
