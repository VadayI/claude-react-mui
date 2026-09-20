# Project kickoff preflight

Before implementation, verify the inputs needed for the actual task:

1. A usable brief: user request, README or docs/PROJECT.md states the scope,
   users and affected flows. Ask only for missing decisions that block the task.
2. Declared React/Vite/TypeScript/MUI/Query/Zustand stack and consistent package
   metadata. Follow the existing architecture; investigate contradictory inputs.
3. The external API pin and vendored schema are available and integrity checked.
   Use non-secret pin metadata/current authorized environment; do not read .env.
   Pull/regenerate through supported tooling when needed. Missing endpoints are
   contract work, never an excuse to invent an API. See api-contract.md.
4. Design references are recommended: docs/design, an accessible running design,
   Figma assets, theme tokens or brief. Record L1-L4 fidelity (default L3). Inspect
   live designs with an available browser capability. Without references, record
   use of MUI defaults; unavailable optional browser plugins are not blockers.
5. Consult current official library documentation for changed APIs. Context7 is
   an optional implementation; official docs are an equivalent. If no verified
   source is reachable, identify the affected uncertainty rather than claiming
   verified compatibility or blocking unrelated work.
6. For remote operations, check gh authentication/repository access without
   secrets. Local implementation can proceed without GitHub. Record remote
   checks as NOT_VERIFIED until the required access is available.

Stop only the dependent action when an essential input is missing; proceed with
independent authorized work. No additional approval is needed for decisions
already supplied by the user. Doctor checks environment capabilities; preflight
checks task inputs. Coordinators delegate within an explicitly selected pipeline;
workers do not adopt a coordinator-only prohibition against implementation.
