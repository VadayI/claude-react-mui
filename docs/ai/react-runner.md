# React isolated check catalog

`templates/ai/checks/react.json` is the P05 catalog that can run honestly in the
shared runner's exact-commit archive. It contains only existing, read-only
repository gates whose prerequisites are explicit and which do not require an
installed dependency tree, Git history, a pull-request base, a browser, or an
application server.

The current isolated profile runs file-size, documented-stub, and feature-README
checks. Missing commands or applicability paths produce `NOT_VERIFIED`; mandatory checks may not disappear as
`NOT_APPLICABLE`.

The following active CI gates remain outside this catalog:

- `npm audit`, typecheck, lint, API type generation, unit coverage, build, and
  bundle size require an explicit dependency-provisioning contract for the
  fresh archive. The runner must not assume a host `node_modules` tree.
- contract synchronization fetches the versioned OpenAPI document from an
  external repository. The current catalog cannot declare or bind that network
  input, so a locally available network must not turn it into isolated evidence.
- living-plan, routes-registry, and guides synchronization require an exact base
  and Git diff. The archive intentionally contains no `.git`, and the runner
  does not synthesize `GATE_BASE`; running them now could create false green
  results.
- Playwright E2E requires declared browser and web-server lifecycle provisioning.

These boundaries are `NOT_VERIFIED`, not passing substitutes for hosted CI.
Expand the catalog only after the shared runner models the missing provisioning
and base inputs explicitly.
