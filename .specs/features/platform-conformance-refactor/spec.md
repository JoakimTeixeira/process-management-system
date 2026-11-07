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

Pending C2 evaluation:

| Gap | Initial position | Final rationale |
| --- | --- | --- |
| API versioning | Defer unless external compatibility needs exist | Pending |
| Global exception filter | Evaluate actual response inconsistency first | Pending |
| Caching | Defer unless measured read pressure/staleness policy exists | Pending |
