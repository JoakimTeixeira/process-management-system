# Contract and Test Pyramid Tasks

**Design:** `.specs/features/contract-and-test-pyramid/design.md`  
**Status:** In Progress

## Execution plan

```text
A1 → A2 → A3 → A4 → A5 ─┐
                    A6 ─┼→ A7 → A8 ─┐
A1 → A9 → A10 ──────────┤           ├→ A12
A1 → A11 ───────────────┘───────────┘
```

## Tasks

### A1 — Persist audit, specifications, and contributor contract ✅

**Where:** `AGENTS.md`, `.specs/codebase/*`, `.specs/features/{contract-and-test-pyramid,vitest-standardization,platform-conformance-refactor}/*`  
**Depends on:** None  
**Requirement:** all planning requirements  
**Tests/Gate:** docs/build — `git diff --check` and artifact review  
**Done when:** audit evidence, 352-test baseline, test matrix, concerns, approved designs/tasks, dependency cross-checks, and ubiquitous terms are recorded. **Complete: 2026-11-07.**

### A2 — Centralize domain enums and Swagger values ✅

**Where:** `api/src/common/enums/`, affected API DTO/types/repositories/seeds and unit specs  
**Depends on:** A1  
**Requirement:** TERM-01  
**Tests/Gate:** unit/quick — API unit suite (≥263 tests)  
**Done when:** lifecycle/architecture/catalog values have one API source; stale uppercase Swagger examples are gone; typed repository/public records consume the source. **Complete: 2026-11-07; 266 API tests passed.**

### A3 — Add deterministic OpenAPI generation ✅

**Where:** API bootstrap/document factory, `api/scripts/generate-openapi.ts`, `api/openapi/openapi.json`, `api/package.json`  
**Depends on:** A2  
**Requirement:** TERM-01, CONTRACT-01  
**Tests/Gate:** contract/full — generate twice and compare; API tests/build pass  
**Done when:** generation does not listen, closes cleanly, and `openapi:check` detects drift. **Complete: 2026-11-07; deterministic SHA-256 verified; 268 API tests passed.**

### A4 — Audit and complete consumed response schemas

**Where:** consumed API controllers/DTOs and OpenAPI contract checks  
**Depends on:** A3  
**Requirement:** CONTRACT-01  
**Tests/Gate:** contract/full  
**Done when:** every consumed endpoint has an intentional schema, including text/void/nullable responses, and the audit is automated.

### A5 — Generate and adopt public contract types [P]

**Where:** `web/public/src/app/core/api/generated/`, public models/services/mappers/specs  
**Depends on:** A4  
**Requirement:** TERM-01, CONTRACT-01  
**Tests/Gate:** unit+contract/full — public suite/build  
**Done when:** contract fields alias generated schemas and presentation adapters remain thin.

### A6 — Generate and adopt backoffice contract types [P]

**Where:** `web/backoffice/src/app/core/api/generated/`, backoffice models/API service/specs  
**Depends on:** A4  
**Requirement:** TERM-01, CONTRACT-01  
**Tests/Gate:** unit+contract/full — backoffice suite/build  
**Done when:** covered DTO fields and role/state unions come from generated schemas.

### A7 — Add contract/schema gate

**Where:** API contract specs, frontend contract fixtures, root scripts  
**Depends on:** A5, A6  
**Requirement:** CONTRACT-01  
**Tests/Gate:** contract/full — `npm run test:contract`  
**Done when:** a breaking field/enum/schema change fails before merge.

### A8 — Centralize public synonym/route mapping

**Where:** public architecture/route helpers, duplicated page/search adapters, specs, `AGENTS.md`  
**Depends on:** A7  
**Requirement:** TERM-02  
**Tests/Gate:** unit/quick — public suite  
**Done when:** page code delegates Current/Target and route conversions to centralized helpers.

### A9 — Add isolated Postgres integration harness

**Where:** `api/test/integration/`, API scripts/config/package  
**Depends on:** A1  
**Requirement:** PYR-02  
**Tests/Gate:** integration/full  
**Done when:** explicit test DB setup migrates once, cleans safely, serializes shared state, and refuses non-test cleanup targets.

### A10 — Cover high-risk SQL against Postgres

**Where:** `api/test/integration/**/*.spec.ts`  
**Depends on:** A9  
**Requirement:** PYR-02  
**Tests/Gate:** integration/full — lifecycle/public/RBAC/procedure+asset clone assertions pass  
**Done when:** real SQL, not only mocked `query`, proves the identified critical paths.

### A11 — Automate curl and DB verification

**Where:** root scripts, `verification/scripts/`, `verification/README.md`  
**Depends on:** A1  
**Requirement:** PYR-01  
**Tests/Gate:** e2e/full — `npm run verify`  
**Done when:** compose/migrate/seed/curl/DB assertions run unattended, fail fast, and are rerunnable.

### A12 — Finalize root pyramid scripts and docs

**Where:** `package.json`, `AGENTS.md`, `.specs/codebase/TESTING.md`  
**Depends on:** A8, A10, A11  
**Requirement:** PYR-01, TERM-02  
**Tests/Gate:** build — all available unit/integration/contract/verify gates  
**Done when:** root commands delegate correctly and docs match final scripts.

## Dependency cross-check

| Task | Body dependencies | Diagram | Status |
| --- | --- | --- | --- |
| A1 | none | start | ✅ |
| A2 | A1 | A1→A2 | ✅ |
| A3 | A2 | A2→A3 | ✅ |
| A4 | A3 | A3→A4 | ✅ |
| A5/A6 | A4 | parallel branches | ✅ |
| A7 | A5,A6 | branches join | ✅ |
| A8 | A7 | A7→A8 | ✅ |
| A9/A11 | A1 | independent branches | ✅ |
| A10 | A9 | A9→A10 | ✅ |
| A12 | A8,A10,A11 | branches join | ✅ |

## Test co-location validation

| Tasks | Layer | Matrix requires | Tasks say | Status |
| --- | --- | --- | --- | --- |
| A2 | API DTO/business types | unit | unit | ✅ |
| A3–A4,A7 | OpenAPI schema | contract/full | contract/full | ✅ |
| A5–A6,A8 | Angular model/service/helper | unit+contract | unit+contract | ✅ |
| A9–A10 | high-risk SQL | integration/full | integration/full | ✅ |
| A11 | critical flows | e2e/full | e2e/full | ✅ |
| A1,A12 | docs/scripts | build | docs/build | ✅ |
