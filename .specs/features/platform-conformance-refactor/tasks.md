# Platform Conformance Refactor Tasks

**Design:** `.specs/features/platform-conformance-refactor/design.md`  
**Status:** Approved

## Feature-wide rules

Each task begins with characterization tests, proceeds in single-goal steps, keeps the app suite green, and runs `npm run verify` when the compose environment is available. Small bug fixes get separate commits and explicit notes.

## Execution plan

```text
A10 + B2 → C1 → C2
A6  + B4 → C3 → C4
A5  + B3 → C5 → C6 → C7
```

## Tasks

### C1 — Move process-version SQL behind the repository

**Where:** process-version service/repository and unchanged characterization/integration specs  
**Depends on:** A10, B2  
**Requirement:** REF-01  
**Tests/Gate:** unit+integration/full  
**Done when:** procedure-existence and procedure/asset clone SQL no longer execute in the service; health probe remains; existing integration behavior passes unchanged.

### C2 — Decide conditional API gaps

**Where:** this spec and, only when justified, focused API code/tests  
**Depends on:** C1  
**Requirement:** REF-01  
**Tests/Gate:** docs review; any implementation receives its own tested task/commit  
**Done when:** versioning, exception filter, and caching each have implement/defer/reject rationale and no speculative code is added.

### C3 — Modernize backoffice BPMN and area detail ✅

**Where:** backoffice BPMN viewer, area-detail, touched unused imports, specs  
**Depends on:** A6, B4  
**Requirement:** REF-01  
**Tests/Gate:** unit/full — backoffice suite/build plus verify  
**Done when:** signal inputs/host metadata/route input-signals replace audited legacy patterns without changing observed rendering/loading/navigation.

**Complete:** 2026-11-07 — route-bound area IDs and BPMN inputs/state now use signals and component host metadata. Focused tests, all 71 backoffice tests, lint, production build, and the database-backed critical-flow verification gate pass.

### C4 — Decompose backoffice version detail

**Where:** version-detail and focused child components/facade/specs  
**Depends on:** C3  
**Requirement:** REF-01  
**Tests/Gate:** unit/full after each extraction — backoffice suite/build plus verify  
**Done when:** lifecycle, asset, procedure, and history/audit UI/orchestration has focused ownership; page shell is materially smaller; all behavior remains covered.

### C5 — Make public routes lazy and bind component inputs ✅

**Where:** public app config/routes and route/page specs  
**Depends on:** A5, B3  
**Requirement:** REF-01  
**Tests/Gate:** unit/full — public suite/build plus verify  
**Done when:** feature routes use `loadComponent`, component input binding is enabled, and redirects/params/query navigation are unchanged.

**Complete:** 2026-11-07 — all public feature routes load standalone components lazily, router component input binding is enabled, and structural tests preserve paths, redirects, parameters, and route data. All 15 public test files / 40 tests, lint, contract, production build, and critical-flow verification pass.

### C6 — Adopt signal-first public data/page state ✅

**Where:** public API service and process-detail/procedure-detail/glossary (plus process-list if the audited CDR path remains) and specs  
**Depends on:** C5  
**Requirement:** REF-01  
**Tests/Gate:** unit/full — public suite/build plus verify  
**Done when:** touched pages have signal-first state and deterministic teardown; no constructor-started unsubscribed HTTP remains; experimental APIs are used only if stable enough.

**Complete:** 2026-11-07 — process/procedure detail state is signal-first, glossary/procedure HTTP subscriptions tear down deterministically, glossary loading starts in `ngOnInit`, and redundant manual change detection is removed. Stable `HttpClient` observables remain the service boundary because Angular 20 marks `httpResource` experimental. All 15 public test files / 41 tests, lint, contract, and production build pass.

### C7 — Modernize public shared components

**Where:** breadcrumbs, BPMN viewer, catalog search/route adapter and specs  
**Depends on:** C6  
**Requirement:** REF-01  
**Tests/Gate:** unit/full — public suite/build plus verify  
**Done when:** signal inputs and host metadata/directives replace audited decorators, route normalization is centralized, and async/fullscreen behavior remains characterized.

## Dependency cross-check

| Task | Body | Diagram | Status |
| --- | --- | --- | --- |
| C1 | A10,B2 | API branch start | ✅ |
| C2 | C1 | C1→C2 | ✅ |
| C3 | A6,B4 | backoffice branch start | ✅ |
| C4 | C3 | C3→C4 | ✅ |
| C5 | A5,B3 | public branch start | ✅ |
| C6 | C5 | C5→C6 | ✅ |
| C7 | C6 | C6→C7 | ✅ |

## Test co-location validation

| Tasks | Layer | Matrix requires | Tasks say | Status |
| --- | --- | --- | --- | --- |
| C1 | high-risk repository SQL | unit+integration/full | unit+integration/full | ✅ |
| C2 | decision docs | docs unless implemented | docs/separate tested task | ✅ |
| C3–C7 | Angular components/services | unit; e2e critical gate | unit/full+verify | ✅ |
