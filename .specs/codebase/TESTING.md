# Testing Strategy

## Baseline (2026-11-07)

| Package | Runner | Suites/specs | Tests | Result |
| --- | --- | ---: | ---: | --- |
| `api` | Jest | 42 | 263 | Pass |
| `web/public` | Jasmine/Karma | 9 | 22 | Pass |
| `web/backoffice` | Jasmine/Karma | 18 | 67 | Pass |
| **Total** | Mixed | 69 | **352** | Pass |

The target runner is Vitest for all three packages. Jest/Karma remains only until the corresponding package is green under Vitest.

## Coverage matrix

| Code layer | Required test type | Gate |
| --- | --- | --- |
| API service business logic | unit | quick |
| API controller guards/DTO metadata | unit | quick |
| API repository SQL mappings | unit; integration for high-risk SQL | quick/full |
| Lifecycle, public visibility, RBAC, clone SQL | integration against Postgres | full |
| API DTO/OpenAPI schemas | contract | full |
| Angular components/services | unit | quick |
| Angular API services/mappers | unit plus contract fixtures | quick/full |
| Critical user flows | automated curl/DB verification | full |
| Scripts/config/docs | build/docs review | build |

## Rules

- Integration and contract specs use only `describe`, `it`, `expect`, `beforeAll`, and `afterAll`; no `jest.*` or `vi.*` APIs.
- DB integration tests use a dedicated test database/schema, run migrations before the suite, clean deterministically, and do not target a developer database.
- Before every Feature C structural refactor, add or confirm characterization tests for the touched behavior. Characterization tests assert current behavior, including quirks, rather than an ideal design.
- A small bug fix discovered during a refactor is allowed only as an isolated commit with an explicit task note.
- Tests are co-located with the task that changes behavior. Never defer them to a later task.
- Test totals must not decrease without an explicit reason.

## Gate commands

These commands evolve with the runner migration; task commits update this file in the same commit as script changes.

| Gate | Command |
| --- | --- |
| API quick (current) | `npm test --prefix api -- --runInBand` |
| Public quick (current) | `npm run test:headless --prefix web/public` |
| Backoffice quick (current) | `npm run test:headless --prefix web/backoffice` |
| Unit target | `npm run test:unit` |
| Integration target | `npm run test:integration` |
| Contract target | `npm run test:contract` |
| Critical-flow target | `npm run verify` |
| Build | `npm run build --prefix api && npm run build --prefix web/public && npm run build --prefix web/backoffice` |

API lint currently applies fixes and is therefore not a read-only gate. Use `npx eslint ...` without `--fix` for validation until scripts are separated.

## Parallelism assessment

| Test type | Parallel-safe? | Constraint |
| --- | --- | --- |
| Unit | Yes | Packages may run in parallel; avoid shared ports/files. |
| Contract | Yes | Generated OpenAPI must already be stable. |
| Integration | No by default | Shared Postgres state; serialize unless isolated databases are used. |
| Verify/E2E | No | Owns the compose stack and seeded state. |
| Build/docs | Yes | Only when tasks do not edit the same files. |
