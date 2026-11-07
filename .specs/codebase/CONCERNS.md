# Codebase Concerns

## Test and contract gaps

- Root `npm test` invokes Jest although the root has no Jest configuration or dependency.
- API uses Jest 30 with `ts-jest` 29; both Angular apps use Karma/Jasmine and ChromeHeadless.
- `api/test/app.e2e-spec.ts` is outside the normal unit run and is stale.
- Frontends hand-maintain API model copies in `web/public/src/app/core/models/public-portal.models.ts` and `web/backoffice/src/app/core/models/backoffice.models.ts`.
- No committed OpenAPI artifact/code generation, schema contract gate, DB-backed repository suite, or automated root verify command exists.
- Mocked SQL tests do not prove lifecycle, published-only, RBAC, and clone queries against Postgres.

## Ubiquitous-language drift

- Canonical lifecycle/architecture/catalog values are duplicated across seeds, DTOs, repositories, API types, and frontend models.
- Swagger examples use stale `DRAFT`/`IN_REVIEW` spellings in process, procedure, process-version, and audit response DTOs.
- Public presentation mappings are duplicated outside the intended architecture/route helpers.

## Platform conformance leftovers

- API: direct SQL for clone operations and `ensureHasProcedure` lives in `ProcessVersionsService`; `HealthService`’s `SELECT 1` is an accepted probe exception.
- API: versioning, a global exception filter, and caching are conditional rule gaps requiring explicit decisions, not speculative code.
- Public: 13 eager routes, no component input binding, missing page characterization specs, imperative/mutable page loading, and legacy breadcrumb/BPMN/search listener patterns.
- Public: the production build already warns that the initial bundle exceeds its 500 kB warning budget; lazy routing should reduce this risk.
- Backoffice: `area-detail.page.ts` uses a route snapshot/`firstValueFrom` and has no spec; BPMN viewer uses decorator inputs/lifecycle/CDR/HostListener and has no spec.
- Backoffice: `version-detail.page.ts` is roughly 2,600 lines. Existing tests cover useful flows but not enough loading, failure, tab, procedure, history, and BPMN behavior for safe decomposition.
- Many backoffice standalone components import `CommonModule` without using it; some still genuinely require pipes or `ngClass`.

## Risk controls

- Contract types land before frontend conformance work.
- Each app migrates to Vitest and gains characterization coverage before its refactors.
- DB and verify gates serialize against isolated/seeded state.
- `version-detail` is extracted in small behavior-preserving steps; orchestration moves only after template-focused seams are covered.
