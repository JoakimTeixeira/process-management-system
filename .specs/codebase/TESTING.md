# Testing Strategy

## Baseline and current floor (2026-11-07)

| Package | Runner | Suites/specs | Tests | Result |
| --- | --- | ---: | ---: | --- |
| `api` unit | Vitest | 48 | 353 | Pass |
| `api` PostgreSQL integration | Vitest with runner-agnostic specs | 3 | 10 | Pass |
| `web/public` | Angular native Vitest | 18 | 47 | Pass |
| `web/backoffice` | Angular native Vitest | 32 | 86 | Pass |
| **Unit total** | Vitest | 98 | **486** | Pass |

Vitest is the active runner for all three packages. Jest and Karma configs and direct dependencies have been removed. Any Jest-named package remaining in a dependency tree is transitive build tooling, not an active test runner. Counts are a no-regression floor unless a task records an explicit reason. The 11 additional backoffice specs compile previously uncovered standalone component definitions and enforce the external module structure.

**Runner audit (2026-11-08):** the API uses `vitest.config.mts` plus focused e2e and integration Vitest configs, and both Angular projects use `@angular/build:unit-test`. Active manifests and source or config files contain no direct Jest, ts-jest, Jasmine, or Karma runner dependency or configuration.

## Coverage matrix

| Code layer | Required test type | Gate |
| --- | --- | --- |
| API service business logic | unit | quick |
| API controller guards/DTO metadata | unit | quick |
| API repository SQL mappings | unit, or integration for high-risk SQL | quick/full |
| Lifecycle, public visibility, RBAC, clone SQL | integration against Postgres | full |
| API DTO/OpenAPI schemas | contract | full |
| Angular components/services | unit | quick |
| Angular API services/mappers | unit plus contract fixtures | quick/full |
| Critical user flows | automated curl/DB verification | full |
| Scripts/config/docs | unit plus build/docs review | quick/build |

## Rules

- Integration and contract specs use only `describe`, `it`, `expect`, `beforeAll`, and `afterAll`, without `jest.*` or `vi.*` APIs.
- DB integration tests use a dedicated test database and schema, run migrations before the suite, clean deterministically, and never target a developer database.
- Before every Feature C structural refactor, add or confirm characterization tests for the touched behavior. Characterization tests assert current behavior, including quirks, rather than an ideal design.
- A small bug fix discovered during a refactor is allowed only as an isolated commit with an explicit task note.
- Tests are co-located with the task that changes behavior. Never defer them to a later task.
- Test totals must not decrease without an explicit reason.

## Root gate commands

These commands evolve with the runner migration, and task commits update this file in the same commit as script changes.

| Gate | Command | Purpose |
| --- | --- | --- |
| Unit | `npm run test:unit` | Runs all three package unit suites and the repository script unit suite (`npm run test:scripts`) concurrently and fails if any suite fails. |
| Integration | `npm run test:integration` | Creates, migrates, exercises, and removes the isolated API PostgreSQL test database. |
| Contract | `npm run test:contract` | Checks OpenAPI drift and schema coverage, generated types, and frontend contract fixtures. |
| API health e2e | `npm run test:e2e` | Boots Nest through the production app factory and asserts `/health` with Supertest. |
| Browser smoke | `npm run test:browser` | Starts isolated public and backoffice Angular servers and checks their entry routes in Chromium. |
| Non-release aggregate | `npm run test:all` | Runs unit, integration, contract, and API health gates, serializing layers that share state. |
| Diagnostics aggregate | `npm run diagnostics` | Runs every package's TypeScript and zero-warning ESLint checks, the backoffice module audit, and an authenticated full-project SonarQube scan. It prints all unresolved Sonar issues and hotspots and continues after earlier local failures. |
| Fast diagnostics | `npm run diagnostics:fast` | Runs TypeScript, zero-warning ESLint/SonarJS, the module audit, and deterministic internal documentation-link checks without claiming full SonarQube parity. |
| SonarQube diagnostics | `npm run diagnostics:sonar` | Regenerates package LCOV coverage, runs the authenticated full-project scan, waits for server processing, and fails for analyzer infrastructure, quality-gate failure, or any unresolved finding. |
| Diagnostics regression | `npm run test:diagnostics` | Uses controlled fixtures to prove local and live SonarQube detection, failure classification, cleanup, and clean rescans. |
| Strict lint | `npm run lint` | Runs ESLint read-only with zero warnings across all packages, then audits backoffice component companions. |
| TypeScript | `npm run typecheck` | Type-checks production and test TypeScript configs across all packages without emitting files. |
| Build | `npm run build` | Builds API, public, and backoffice packages. |
| Critical-flow/release | `npm run verify` | Owns an isolated Compose project, migrates and seeds, runs curl flows and DB assertions, then cleans up. |

Package-level focused commands remain useful while iterating: `npm test --prefix api`, `npm run test:headless --prefix web/public`, and `npm run test:headless --prefix web/backoffice`.

## Recommended use

1. During a focused change, run the affected package or spec.
2. During iteration run `npm run diagnostics:fast`. Before handoff run `npm run diagnostics` with the local SonarQube service available.
3. Before release handoff, run `npm run test:all`, `npm run test:browser`, `npm run build`, and `npm run verify` serially.

`npm run verify` requires Docker Desktop with Compose v2 and free host ports `3100` and `55432`. See [verification/README.md](../../verification/README.md) for overrides and failure cleanup. Do not run it concurrently with another verification stack unless every project name and host port is isolated.

Package `lint:check` scripts are read-only and fail on any warning. Package `lint` scripts may retain their existing fix behavior for contributor workflows, while the root `npm run lint` gate always uses the strict read-only variants.

The full diagnostics gate reads the ignored local token created by `npm run sonar:start`, or a `SONAR_TOKEN` environment override, and uses `SONAR_HOST_URL` (default `http://localhost:9000`). VS Code must be bound in SonarQube Connected Mode to the shared `process-management-system` project so the IDE and CLI use the same server quality profiles. The scanner configuration includes TypeScript, JavaScript, HTML, CSS/SCSS, and infrastructure files such as Dockerfiles. Scanner output is followed by API queries that render every unresolved issue and unreviewed hotspot with its file, line, severity, and rule. Credentials remain outside Git and outside the application `.env`. See [docs/diagnostics.md](../../docs/diagnostics.md) for lifecycle, rotation, CI, coverage, and known parity limits.

The opt-in API mutation pilot runs with `npm run test:mutation --prefix api`. It is intentionally scoped and non-blocking (`break: null`). Generated reports are written under `api/reports/mutation/` and are ignored by Git.

## Parallelism assessment

| Test type | Parallel-safe? | Constraint |
| --- | --- | --- |
| Unit | Yes | Packages may run in parallel, provided shared ports and files are avoided. |
| Contract | Yes | Generated OpenAPI must already be stable. |
| Integration | No by default | Shared Postgres state, so serialize runs unless isolated databases are used. |
| Verify/E2E | No | Owns the compose stack and seeded state. |
| Build/docs | Yes | Only when tasks do not edit the same files. |
