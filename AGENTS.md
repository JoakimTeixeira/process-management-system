# Contributor Contract

## Ubiquitous language

Use these terms in API code, generated contracts, tests, and documentation:

- Hierarchy: **Area → Process → Procedure**.
- A **Process Version** is the governed, versioned representation of a Process.
- Lifecycle states: `Draft`, `In Review`, `Approved`, `Published`, `Archived`.
- Architecture states: `AS-IS`, `TO-BE`.
- Catalog kinds: `Area`, `Process`, `Procedure`, `Asset`.
- Roles: `EDITOR`, `REVIEWER`, `PUBLISHER`, `VIEWER`, `SYSTEM_ADMIN`.

The public UI may present `AS-IS` as “Current State” and `TO-BE` as “Target State”, but only centralized route/UI helpers may perform that translation. Lowercase `as-is` and `to-be` route parameters are presentation values, not alternate domain enums.

- Keep architecture label/state/view-ID conversion in `web/public/src/app/core/ui/architecture-view.helpers.ts`.
- Keep catalog paths, legacy search-link normalization, and navigation target parsing in `web/public/src/app/core/routing/process-route.helper.ts`.

## Test contract

Follow the test pyramid and gate commands in `.specs/codebase/TESTING.md`. Integration and contract tests must remain runner-agnostic. Before structural conformance refactors, add characterization tests that pin actual observable behavior.

## Generated contracts

The API OpenAPI document is the contract source. Do not hand-maintain frontend copies of contract-covered DTO fields or enums. Regenerate the per-app contract types after API schema changes and include generated output in the same commit.
