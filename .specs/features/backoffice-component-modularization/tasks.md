# Backoffice Component Modularization Tasks

**Design:** `.specs/features/backoffice-component-modularization/design.md`  
**Status:** Complete

## Execution plan

```text
M1 → M2.01 … M2.25 → M3 → M4
```

The M2 rows are independent atomic component extractions. They run sequentially because they share
the backoffice test/build outputs and are committed one at a time.

## Tasks

### M1 — Add missing component characterization specs

**Where:** the 11 production components without a same-basename spec  
**Depends on:** C4  
**Requirement:** MOD-01  
**Tests/Gate:** unit/quick — all backoffice tests pass and the test count increases  
**Done when:** every production component has a focused spec before its template/style moves.

**Complete:** 2026-11-08 — 11 standalone-definition specs were added before extraction; the
backoffice floor increased from 21 files / 75 tests to 32 files / 86 tests.

### M2 — Externalize each production component module

**Depends on:** M1  
**Requirement:** MOD-01  
**Tests/Gate:** focused Angular unit spec/quick for each row  
**Done when:** each row has same-basename `.ts`, `.html`, `.scss`, and `.spec.ts` files and uses
`templateUrl` plus `styleUrl` with unchanged behavior.

| Task | Component | Existing spec | Status |
| --- | --- | --- | --- |
| M2.01 | `app` | Added by M1 | ✅ |
| M2.02 | `shared/backoffice-shell.component` | Yes | ✅ |
| M2.03 | `shared/confirm-delete-dialog.component` | Added by M1 | ✅ |
| M2.04 | `shared/bpmn/backoffice-bpmn-viewer.component` | Yes | ✅ |
| M2.05 | `features/auth/login.page` | Added by M1 | ✅ |
| M2.06 | `features/home/role-home.page` | Added by M1 | ✅ |
| M2.07 | `features/admin/team-form.page` | Yes | ✅ |
| M2.08 | `features/admin/team-list.page` | Yes | ✅ |
| M2.09 | `features/admin/user-form.page` | Yes | ✅ |
| M2.10 | `features/admin/user-list.page` | Added by M1 | ✅ |
| M2.11 | `features/areas/area-detail.page` | Yes | ✅ |
| M2.12 | `features/areas/area-form.page` | Yes | ✅ |
| M2.13 | `features/areas/area-list.page` | Yes | ✅ |
| M2.14 | `features/glossary/glossary-form.page` | Added by M1 | ✅ |
| M2.15 | `features/glossary/glossary.page` | Added by M1 | ✅ |
| M2.16 | `features/procedures/procedure-list.page` | Yes | ✅ |
| M2.17 | `features/processes/process-form.page` | Yes | ✅ |
| M2.18 | `features/processes/process-list.page` | Yes | ✅ |
| M2.19 | `features/processes/process-versions.page` | Yes | ✅ |
| M2.20 | `features/versions/version-asset-panel.component` | Added by M1 | ✅ |
| M2.21 | `features/versions/version-detail.page` | Yes | ✅ |
| M2.22 | `features/versions/version-form.page` | Yes | ✅ |
| M2.23 | `features/versions/version-history-panel.component` | Added by M1 | ✅ |
| M2.24 | `features/versions/version-lifecycle-panel.component` | Added by M1 | ✅ |
| M2.25 | `features/versions/version-procedure-panel.component` | Added by M1 | ✅ |

### M3 — Enforce the module structure audit

**Where:** backoffice audit script and package scripts  
**Depends on:** M2.01–M2.25  
**Requirement:** MOD-01  
**Tests/Gate:** build — audit reports 25 complete component modules and no inline production
template/style metadata  
**Done when:** the invariant is executable locally and in the root lint gate.

**Complete:** 2026-11-08 — `check:component-modules` reports 25 complete modules, verifies each
companion file, and rejects inline production template/style metadata.

### M4 — Run strict lint, typecheck, unit, and build gates

**Where:** package/root scripts and testing documentation  
**Depends on:** M3, B6, B8  
**Requirement:** MOD-01  
**Tests/Gate:** build/full — ESLint uses `--max-warnings=0`; TypeScript, unit, browser, mutation,
and production build gates pass  
**Done when:** no TypeScript or ESLint issue appears in validation output.

**Complete:** 2026-11-08 — root lint is read-only with `--max-warnings=0`, all production/test
TypeScript configs pass, all 486 unit tests and deeper pyramid layers pass, both production Angular
builds pass, two Chromium smokes pass, and the mutation pilot kills 33/33 mutants.

## Dependency cross-check

| Task | Body | Diagram | Status |
| --- | --- | --- | --- |
| M1 | C4 | Start after completed C4 | ✅ |
| M2 rows | M1 | M1→M2 | ✅ |
| M3 | all M2 rows | M2→M3 | ✅ |
| M4 | M3, B6, B8 | M3→M4 plus optional-task join | ✅ |

## Test co-location validation

| Tasks | Layer | Matrix requires | Tasks say | Status |
| --- | --- | --- | --- | --- |
| M1–M2 | Angular components | unit | focused/full unit | ✅ |
| M3 | script/config | build | structural build audit | ✅ |
| M4 | app/config | unit+build | strict lint/typecheck/unit/build | ✅ |
