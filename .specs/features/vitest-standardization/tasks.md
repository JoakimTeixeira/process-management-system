# Vitest Standardization Tasks

**Design:** `.specs/features/vitest-standardization/design.md`  
**Status:** Complete

## Execution plan

```text
A1 → B1 → B2 ─┐
A1 → B3 ──────┼→ B5 → B7
A1 → B4 ──────┘
      B2 → B6 (optional)
```

## Tasks

### B1 — Prove API Vitest on a DI-heavy spec ✅

**Where:** API Vitest config/setup/package and one DI-heavy spec  
**Depends on:** A1  
**Requirement:** TEST-01  
**Tests/Gate:** unit/quick — pilot passes under Vitest and unchanged Jest suite remains ≥263  
**Done when:** Nest decorators/reflection and mock-reset semantics are demonstrated. **Complete: 2026-11-07; Vitest pilot 3 tests, unchanged Jest suite 325 tests, and API build passed.**

### B2 — Migrate API suite and repair e2e ✅

**Where:** API specs/config/package and `api/test/app.e2e-spec.ts`  
**Depends on:** B1  
**Requirement:** TEST-01  
**Tests/Gate:** unit+e2e/full — API unit count does not decrease; `/health` Supertest passes  
**Done when:** API scripts use Vitest and Jest/ts-jest configuration/dependencies are removed. **Complete: 2026-11-07; Vitest runs 47 unit files / 350 tests, the repaired `/health` Supertest e2e, 79 contract assertions, and 3 PostgreSQL integration files / 10 tests. Jest/ts-jest configuration and direct dependencies are removed; coverage, build, lint, and residue checks pass.**

### B3 — Migrate public and add page characterization [P] ✅

**Where:** public Angular config/package/tsconfig and feature/route specs  
**Depends on:** A1  
**Requirement:** TEST-01  
**Tests/Gate:** unit/full — existing 22 plus new characterization tests pass under Vitest; build passes  
**Done when:** process list/detail, procedure detail, glossary, and navigation/query behavior are pinned. **Complete: 2026-11-07; Angular-native Vitest runs 14 files / 37 tests (11 new), V8 coverage reports 71.71% statements/lines, and lint, contract, and production-build gates pass.**

### B4 — Migrate backoffice and expand characterization [P] ✅

**Where:** backoffice Angular config/package/tsconfig and area/version/BPMN specs  
**Depends on:** A1  
**Requirement:** TEST-01  
**Tests/Gate:** unit/full — existing 67 plus new characterization tests pass; build passes  
**Done when:** area-detail has a loading spec and version-detail/BPMN seams needed by Feature C are pinned. **Complete: 2026-11-07; Angular-native Vitest runs 21 files / 71 tests, V8 coverage reports 78.73% statements/lines, lint and contract checks pass, and the production build passes with existing budget warnings.**

### B5 — Standardize final root unit runner ✅

**Where:** root/package scripts and testing docs  
**Depends on:** B2, B3, B4, A12  
**Requirement:** TEST-01  
**Tests/Gate:** build — `npm run test:unit` passes all packages; builds pass  
**Done when:** no active Jest/Karma config/dependency remains and docs match commands. **Complete: 2026-11-08; `npm run test:unit` runs all 87 Vitest files / 475 tests across the API and both Angular apps, the unified root build passes, and an active manifest/config audit finds no direct Jest, ts-jest, Jasmine, or Karma runner dependency/configuration.**

### B6 — Optional Stryker pilot [P3] ⏸ deferred

**Where:** API mutation config/docs  
**Depends on:** B2  
**Requirement:** PYR-03  
**Tests/Gate:** report/full  
**Done when:** a scoped report exists and survivors are triaged without a blocking threshold.

**Decision:** Deferred on 2026-11-08. This is an explicitly optional P3 branch and is not required by the completed TEST-01 or DOCS-01 requirements. Adding Stryker dependencies and a mutation baseline remains a separate opt-in quality experiment.

### B7 — Add maintainer quickstart ✅

**Where:** `README.md`  
**Depends on:** B5, A12  
**Requirement:** DOCS-01  
**Tests/Gate:** docs/build — every documented command resolves and section stays concise  
**Done when:** clone-to-verify steps and script map are complete with pointers, not duplicated manuals. **Complete: 2026-11-08; the README now gives locked install, environment, aggregate test, build, and release verification steps; maps every root test layer; points to interactive Compose migrate/seed instructions and the contributor/testing/verification manuals; and removes the obsolete Chrome test-runner prerequisite.**

## Dependency cross-check

| Task | Body | Diagram | Status |
| --- | --- | --- | --- |
| B1 | A1 | A1→B1 | ✅ |
| B2 | B1 | B1→B2 | ✅ |
| B3/B4 | A1 | parallel branches | ✅ |
| B5 | B2,B3,B4,A12 | branch join (A12 cross-feature) | ✅ |
| B6 | B2 | optional B2 branch | ⏸ deferred |
| B7 | B5,A12 | B5→B7 (A12 already required by B5) | ✅ |

## Test co-location validation

| Tasks | Layer | Matrix requires | Tasks say | Status |
| --- | --- | --- | --- | --- |
| B1–B2 | API unit/e2e | unit+e2e | unit+e2e | ✅ |
| B3–B4 | Angular components | unit | unit+build | ✅ |
| B5 | runner config | build + all unit | build + all unit | ✅ |
| B6 | optional quality tool | report | report | ⏸ deferred |
| B7 | docs | docs/build | docs/build | ✅ |
