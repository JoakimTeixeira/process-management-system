# Platform Conformance Refactor Specification

**Status:** Approved

## Problem statement

The audit found repository-boundary and Angular platform-pattern leftovers. These changes are structurally risky, especially the 2,600-line backoffice version page, so they must follow the relevant app’s contract/Vitest work and preserve behavior through characterization tests and critical-flow verification.

## Goals

- [ ] Move API data access behind repository boundaries.
- [ ] Record explicit decisions for conditional API versioning/filter/cache guidance.
- [ ] Modernize identified Angular route, input, listener, loading, and state patterns.
- [ ] Decompose version detail into focused units without behavior drift.
- [ ] Resolve every audited leftover or record a reasoned deferral.

## Out of scope

| Item | Reason |
| --- | --- |
| Unrelated redesign or new features | Refactor must preserve observable behavior. |
| Speculative API versioning/filter/cache | Implement only against a concrete need. |
| Broad CommonModule cleanup | Only files touched by an approved task. |
| New public HTTP interceptors | Public app has no current auth/cross-cutting need. |

## User story

### P1: REF-01 — Conformance without behavior drift ⭐ MVP

As a maintainer, I want audited legacy patterns modernized with a dependable safety net.

1. WHEN a task starts THEN characterization tests SHALL pin actual current touched behavior first.
2. WHEN a refactor step completes THEN the app suite SHALL be green before the next step.
3. WHEN a small bug is fixed THEN it SHALL be an isolated commit with an explicit task note.
4. WHEN Feature C completes THEN every audited item SHALL be resolved or explicitly deferred with rationale.
5. WHEN a task completes THEN critical-flow verification SHALL still pass where the environment is available.

**Independent test:** Reverting a structural refactor still leaves its characterization tests green against the old behavior.

## Edge cases

- WHEN a browser-only API is unavailable in jsdom THEN a behavior-focused fake SHALL preserve the test point.
- WHEN `httpResource` experimental behavior is unsuitable THEN stable `HttpClient` plus signals and `takeUntilDestroyed` SHALL be used.
- WHEN route input binding changes activation mechanics THEN params/query/redirect behavior SHALL remain characterized.
- WHEN an existing quirk is a small bug THEN it SHALL not be silently bundled into a refactor.

## Traceability

| Requirement | Tasks | Status |
| --- | --- | --- |
| REF-01 | C1–C7 | In Tasks |

**Coverage:** 1 total, 1 mapped, 0 unmapped.

## Conditional API decisions

C2 evaluation completed 2026-11-08:

| Gap | Decision | Final rationale |
| --- | --- | --- |
| API versioning | Defer | The API and both in-repository frontends ship together from one generated OpenAPI contract, and contract drift already fails before merge. There is no external consumer, supported compatibility window, or requirement to serve parallel representations. Introduce URI/header versioning only when an independently deployed consumer requires a documented compatibility period. |
| Global exception filter | Reject for current scope | Validation and domain failures already use Nest's standard `ValidationPipe` and `HttpException` responses; the audit found no competing application-wide error envelope. Repository `Error`/`TypeError` paths represent unexpected invariants and should remain opaque 500 responses. A filter without an agreed public error schema would only reshape responses and risk leaking internals; observability/log correlation is a separate requirement. |
| Caching | Defer | No measured latency/read-pressure problem or cache hit target exists, and published visibility changes during publish/archive/promotion require an explicit invalidation and staleness policy. Add endpoint or HTTP caching only after metrics identify a target and lifecycle-triggered invalidation, tenant/user scope, and TTL semantics are specified and tested. |
