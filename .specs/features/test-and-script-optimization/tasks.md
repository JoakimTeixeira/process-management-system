# Test and Script Optimization Tasks

## T1 — Baseline naming, runtime, scripts, and coverage

- **Requirements:** TSO-01, TSO-02, TSO-03, TSO-04
- **Status:** Complete
- **Done when:** current violations, package timings, script bottlenecks, LCOV imports, and SonarQube
  file-level coverage gaps are recorded from executable commands.
- **Evidence:** the audit found 234 nonconforming titles in 127 test files; root unit execution took
  about 58 seconds before runner changes; API isolation spawned 58 workers; diagnostics used
  synchronous child processes; external links were checked serially; and the live SonarQube baseline
  reported 60.0 percent overall coverage and 8.5 percent new-code coverage.

## T2 — Enforce standardized test titles

- **Requirements:** TSO-01, TSO-05
- **Depends on:** T1
- **Status:** Complete
- **Done when:** every static test title starts with `should ` and a tested repository audit rejects a
  controlled nonconforming fixture with file and line output.
- **Evidence:** `npm run test:naming`, the focused checker tests, root lint, and root typecheck pass;
  every discovered static `it` and `test` title starts with `should `.

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

## T7 — Harden and validate web containers

- **Requirements:** TSO-06
- **Status:** Complete
- **Done when:** both runtime images contain root-owned, non-writable configuration and static files;
  run as non-root; answer their health endpoints; and show no error-level startup log entries.
- **Evidence:** both images build; runtime UID is 101; nginx config is `root:root` mode `0444`;
  static roots are `root:root` and non-writable; public, backoffice, and API return HTTP 200; recent
  application Compose logs contain notices and access records only.
