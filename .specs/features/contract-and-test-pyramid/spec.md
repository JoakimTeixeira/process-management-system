# Contract and Test Pyramid Specification

**Status:** Approved

## Problem statement

The repository has a green unit base but no enforced pyramid or contract source. Frontend models and domain values are duplicated, Swagger examples drift from runtime values, high-risk SQL is only mock-tested, and the existing curl/DB harness requires manual orchestration.

## Goals

- [ ] Make API/OpenAPI the source for frontend contract shapes and ubiquitous terms.
- [ ] Fail deterministically on breaking schema changes.
- [ ] Verify lifecycle, visibility, RBAC, and clone SQL against isolated Postgres.
- [ ] Run the existing critical-flow curl/DB harness unattended.
- [ ] Document test layers and canonical terms.

## Out of scope

| Item | Reason |
| --- | --- |
| Pact and microservice contracts | The system is a monolith. |
| Shared npm workspace contract package | Per-app generation is simpler today. |
| Full browser suite | Curl verification is the P1 critical-flow gate. |
| CI workflow | No workflow exists; establish deterministic manual gates first. |

## User stories

### P1: TERM-01 — API contract owns ubiquitous terms ⭐ MVP

As a frontend maintainer, I want generated API types so contract shapes and domain values cannot drift by hand.

1. WHEN an API DTO/enum changes THEN generated frontend types SHALL change or the contract gate SHALL fail.
2. WHEN a frontend consumes covered fields THEN it SHALL use generated contract types rather than duplicate unions.
3. WHEN Swagger describes canonical values THEN it SHALL use `Draft`, `In Review`, `Approved`, `Published`, `Archived`, `AS-IS`, `TO-BE`, `Area`, `Process`, `Procedure`, and `Asset`.
4. WHEN public labels differ from domain values THEN only centralized helpers SHALL translate them.

**Independent test:** Rename a response field or enum member temporarily; generation/check tests fail.

### P1: PYR-01 — Critical-path automated verification ⭐ MVP

As a release owner, I want the curl/DB harness automated from a fresh stack.

1. WHEN `npm run verify` runs THEN it SHALL bootstrap compose, migrate/seed, run the curl harness, and assert DB evidence.
2. WHEN negative auth/RBAC and published-only cases run THEN denials/visibility SHALL be asserted.
3. WHEN a clean environment runs the command THEN defaults SHALL be safe and prerequisites documented.

**Independent test:** Run `npm run verify` from documented setup and observe a zero exit code.

### P1: PYR-02 — DB-backed integration tests ⭐ MVP

As an API maintainer, I want high-risk SQL tested against Postgres.

1. WHEN lifecycle/public/RBAC/clone paths are tested THEN assertions SHALL exercise real SQL.
2. WHEN integration tests start THEN they SHALL use an isolated test database/schema and migrated schema.
3. WHEN tests are authored during runner migration THEN they SHALL remain runner-agnostic.

**Independent test:** `npm run test:integration --prefix api` passes against the dedicated Postgres database.

### P1: CONTRACT-01 — Contract/schema tests ⭐ MVP

As a frontend consumer, I want schema checks that fail before API changes silently break Angular.

1. WHEN OpenAPI is generated THEN covered response schemas SHALL be checked.
2. WHEN a consumed endpoint lacks a response schema THEN the coverage audit SHALL fail.
3. WHEN frontend mapper fixtures compile/run THEN they SHALL use generated types.

**Independent test:** A temporary breaking response change fails `npm run test:contract`.

### P2: TERM-02 — Canonical glossary enforcement

As a contributor, I want code-facing docs to prevent synonyms from becoming domain values.

1. WHEN contributors read `AGENTS.md` THEN canonical hierarchy, states, kinds, and roles SHALL be explicit.
2. WHEN lowercase route segments are used THEN docs SHALL identify them as presentation parameters.

## Edge cases

- WHEN OpenAPI generation fails to close the Nest app THEN the command SHALL fail rather than hang.
- WHEN an integration DB name is not explicitly test-scoped THEN the harness SHALL refuse destructive cleanup.
- WHEN verify is rerun THEN generated runtime artifacts SHALL not make the run fail.
- WHEN an endpoint intentionally returns text/void/nullable data THEN its OpenAPI schema SHALL describe that intentionally.

## Requirement traceability

| Requirement | Tasks | Status |
| --- | --- | --- |
| TERM-01 | A2–A7 | In Tasks |
| PYR-01 | A11–A12 | In Tasks |
| PYR-02 | A9–A10 | In Tasks |
| CONTRACT-01 | A3–A7 | In Tasks |
| TERM-02 | A8, A12 | In Tasks |

**Coverage:** 5 total, 5 mapped, 0 unmapped.

## Success criteria

- [ ] Breaking API shape changes fail contract checks.
- [ ] Wrong high-risk SQL fails integration tests.
- [ ] Critical flow failures make `npm run verify` non-zero.
- [ ] Frontends no longer own covered contract unions.
