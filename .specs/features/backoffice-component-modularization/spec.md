# Backoffice Component Modularization Specification

**Status:** In Progress

## Problem statement

The public Angular application primarily keeps component class, template, styles, and tests in
separate companion files, while the backoffice still embeds 25 production templates and 16 style
blocks in TypeScript. The mixed layout makes large components harder to navigate and allows HTML
and SCSS linting to be obscured inside TypeScript.

## Goals

- [ ] Give every backoffice production component a `.ts`, `.html`, `.scss`, and `.spec.ts`
  companion file.
- [ ] Replace every production `template:` and `styles:` metadata entry with `templateUrl` and
  `styleUrl` without changing selectors, rendering, or behavior.
- [ ] Add focused characterization coverage for components that currently lack a spec.
- [ ] Make TypeScript, Angular template, and SCSS ownership independently visible to tooling.
- [ ] Enforce a repeatable structural audit and zero-warning lint/typecheck gate.

## User story

### P1: MOD-01 — Consistent backoffice component modules

As a maintainer, I want every backoffice component to use external template and style files so that
TypeScript, HTML, SCSS, and tests can be reviewed and linted independently.

1. WHEN a production component is inspected THEN matching `.ts`, `.html`, `.scss`, and `.spec.ts`
   files SHALL exist.
2. WHEN component metadata is inspected THEN it SHALL use `templateUrl` and `styleUrl`, with no
   production inline `template:` or `styles:` entries.
3. WHEN the refactor runs THEN existing rendering, outputs, routing, and service orchestration SHALL
   remain unchanged.
4. WHEN the gate runs THEN backoffice unit tests, production build, TypeScript checks, and ESLint
   SHALL pass with zero warnings or errors.

## Out of scope

| Item | Reason |
| --- | --- |
| Visual redesign | This is a structure-only refactor. |
| Service or state-management refactor | Component behavior must remain stable. |
| Inline templates in test-only host components | Test fixtures are not production component modules. |
| Public-app breadcrumbs cleanup | The request is scoped to `web/backoffice`. |

## Traceability

| Requirement | Tasks | Status |
| --- | --- | --- |
| MOD-01 | M1–M4 | In Progress |

**Coverage:** 1 total, 1 mapped, 0 unmapped.
