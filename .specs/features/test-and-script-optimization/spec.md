# Test and Script Optimization Specification

## Objective

Make the repository test suite consistent, enforceable, fast enough for routine use, and honestly
covered above 80 percent in SonarQube without weakening the quality gate or hiding testable code.

## Requirements

### TSO-01 — Test case language

Every executable `it(...)` or `test(...)` case with a static title must start with `should `.
Suite names remain noun-oriented context. A repository audit must fail with file and line evidence
when a static test title violates the convention.

### TSO-02 — Fast unit feedback

The root unit gate must keep package suites isolated while using bounded concurrency. Package
runner settings may be changed only when repeated clean runs prove that shared module state does
not leak between tests. Runtime evidence must be recorded before and after optimization.

### TSO-03 — Efficient repository scripts

Independent fast diagnostics should run concurrently in bounded groups. External link checks
should use bounded concurrency and continue reporting every failing reference. Ordered workflows
such as database integration, SonarQube analysis, and release verification must remain serialized.

### TSO-04 — Honest SonarQube coverage

SonarQube must import fresh API, public, backoffice, and repository-script LCOV reports without
path warnings. Coverage scope must match the package runners for declarative or generated files.
Testable application and tooling behavior must not be excluded to reach the threshold. Overall and
new-code quality-gate coverage must be at least 80 percent.

### TSO-05 — Regression safety

The naming audit, optimized orchestration, coverage normalization, and bounded link checking need
focused tests. The final tree must pass the naming audit, script tests, unit suites, diagnostics,
build, and release-level gates required by `.specs/codebase/TESTING.md`.

## Non-goals

- Parallelizing shared-database integration or release verification workflows.
- Reducing test counts or removing behavioral assertions for speed.
- Broad SonarQube coverage exclusions for services, components, helpers, or repository scripts.
- Replacing the active Vitest-based runners.
