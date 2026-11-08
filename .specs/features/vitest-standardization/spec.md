# Vitest Standardization Specification

**Status:** Complete

## Problem statement

API tests use Jest while both Angular apps use Karma/Jasmine and require Chrome. Root scripts are ambiguous, the API e2e smoke is stale, and contributors lack one unit-test command.

## Goals

- [x] Run all package unit tests on Vitest with decorator metadata intact.
- [x] Migrate one package at a time while retaining its previous runner until green.
- [x] Repair the API bootstrap/health e2e smoke.
- [x] Add characterization coverage needed by later conformance work.
- [x] Provide one root unit command and concise maintainer quickstart.

## Out of scope

| Item | Reason |
| --- | --- |
| Required mutation gate | Optional pilot only. |
| GitHub Actions | No existing workflow. |

## User stories

### P1: TEST-01 — Unified Vitest runner ⭐ MVP

As a maintainer, I want one test runner across all packages.

1. WHEN `npm run test:unit` runs THEN API, public, and backoffice Vitest suites SHALL run.
2. WHEN package `npm test` runs THEN it SHALL use Vitest/Angular unit-test builder, not Jest/Karma.
3. WHEN Nest tests run THEN decorators and reflection metadata SHALL behave correctly.
4. WHEN a package is not yet green THEN its old runner SHALL remain available as a fallback.
5. WHEN API e2e runs THEN Supertest SHALL verify bootstrap and `/health` under Vitest.

### P2: DOCS-01 — Maintainer quickstart

As a new maintainer, I want setup and the core script map in one short README section.

1. WHEN README is read THEN prerequisites, env, compose, migrate/seed, and core scripts SHALL be findable in one place.
2. WHEN depth is needed THEN README SHALL link to docs, `AGENTS.md`, and testing strategy.
3. WHEN scripts change THEN README SHALL change with them and stay under roughly one page.

### P3: E2E-01 — Browser smoke tests

Add Playwright smoke coverage for the public and backoffice application shells after the API/verify
gates have stabilized. The initial scope proves real browser bootstrap and critical unauthenticated
entry routes; curl/DB verification remains the deeper workflow gate.

### P3: PYR-03 — Mutation testing pilot

Optional Stryker pilot for selected API services; survivors do not initially block gates.

## Edge cases

- WHEN Jasmine-compatible global tests migrate THEN no assertions SHALL be weakened.
- WHEN mocks reset between tests THEN Vitest SHALL preserve the previous clear/reset/restore semantics.
- WHEN Angular tests run in jsdom THEN browser-only BPMN/fullscreen behavior SHALL be characterized with explicit fakes.

## Traceability

| Requirement | Tasks | Status |
| --- | --- | --- |
| TEST-01 | B1–B5 | Complete |
| DOCS-01 | B7 | Complete |
| E2E-01 | B8 | Complete |
| PYR-03 | B6 | Complete |

**Coverage:** 4 total, 4 mapped to executable tasks, 0 unmapped.
