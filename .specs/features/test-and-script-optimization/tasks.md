# Test and Script Optimization Tasks

## T1 — Baseline naming, runtime, scripts, and coverage

- **Requirements:** TSO-01, TSO-02, TSO-03, TSO-04
- **Status:** In progress
- **Done when:** current violations, package timings, script bottlenecks, LCOV imports, and SonarQube
  file-level coverage gaps are recorded from executable commands.

## T2 — Enforce standardized test titles

- **Requirements:** TSO-01, TSO-05
- **Depends on:** T1
- **Done when:** every static test title starts with `should ` and a tested repository audit rejects a
  controlled nonconforming fixture with file and line output.

## T3 — Optimize unit runner execution

- **Requirements:** TSO-02, TSO-05
- **Depends on:** T1
- **Done when:** safe runner/concurrency changes pass repeated package and root unit runs and improve
  or preserve elapsed time without reducing the test floor.

## T4 — Optimize diagnostics and link scripts

- **Requirements:** TSO-03, TSO-05
- **Depends on:** T1
- **Done when:** independent checks and external requests use bounded concurrency, ordered gates stay
  serialized, and focused tests prove complete failure collection.

## T5 — Restore honest 80 percent SonarQube coverage

- **Requirements:** TSO-04, TSO-05
- **Depends on:** T1, T2, T3, T4
- **Done when:** all four fresh LCOV reports import without warnings and SonarQube reports at least 80
  percent overall and new-code coverage with the strict quality gate passing.

## T6 — Run release-level regression gates

- **Requirements:** TSO-05
- **Depends on:** T2, T3, T4, T5
- **Done when:** script tests, unit, integration, contract, e2e, browser, diagnostics, build, and verify
  pass serially where shared state requires it, with final timing and coverage evidence recorded.
