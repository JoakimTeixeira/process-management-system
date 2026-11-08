# CLI Diagnostics Parity Tasks

## T1 — Split the mixed diagnostics commit

- **Requirements:** DP-10
- **Status:** Complete
- **Done when:** API container security, Swagger tooling, CLI diagnostics, and editor association
  are separate commits.
- **Gate:** focused Docker build/user check and API lint.

## T2 — Add the local SonarQube lifecycle

- **Requirements:** DP-04, DP-05
- **Status:** Complete
- **Depends on:** T1
- **Files:** `docker-compose.yml`, `scripts/sonar-local.mjs`, `.gitignore`, `package.json`
- **Done when:** start/status/stop/token commands manage only the optional SonarQube service in the
  main Compose project, bootstrap ignored credentials, preserve volumes, and never print secrets
  except through the explicit token command.
- **Gate:** start, status, and Compose configuration validation.

## T3 — Make Sonar result collection failure-safe

- **Requirements:** DP-02, DP-03
- **Status:** Complete
- **Depends on:** T2
- **Files:** `scripts/sonar-api.mjs`, `scripts/sonar-check.mjs`, `scripts/diagnostics.mjs`,
  `package.json`, `sonar-project.properties`
- **Done when:** failure categories are explicit, compute completion and pagination are handled,
  current issue/hotspot API parameters work, and any finding or failed analyzer produces nonzero.
- **Gate:** root lint/typecheck and full local Sonar scan.

## T4 — Align VS Code analyzers

- **Requirements:** DP-06
- **Status:** Complete
- **Depends on:** T2
- **Files:** `.sonarlint/connectedMode.json`, `.vscode/settings.json`, `.vscode/extensions.json`
- **Done when:** the shared project association and ESLint workspace roots are explicit and all
  configuration files parse.
- **Gate:** JSON parsing and diagnostics fast.

## T5 — Add diagnostics regression tests

- **Requirements:** DP-01, DP-02, DP-03, DP-07
- **Status:** Complete
- **Depends on:** T3
- **Files:** `scripts/sonar-api.test.mjs`, `scripts/diagnostics-regression.mjs`, `package.json`,
  `.gitignore`
- **Done when:** every required positive, negative, infrastructure, and clean fixture is executable,
  asserts the expected path/rule/exit status, and removes its temporary files.
- **Gate:** diagnostics unit, fast fixture, and Sonar fixture commands.

## T6 — Resolve repository analyzer findings

- **Requirements:** DP-01, DP-02
- **Status:** Complete
- **Depends on:** T3, T5
- **Files:** only files named by current analyzer output
- **Done when:** TypeScript, ESLint, and SonarQube scans contain no unresolved issue, hotspot,
  warning, or error.
- **Gate:** `npm run diagnostics:fast`, `npm run diagnostics:sonar`, `npm run diagnostics`.

## T7 — Document diagnostics and secret handling

- **Requirements:** DP-05, DP-08
- **Status:** Complete
- **Depends on:** T2, T3, T4, T5
- **Files:** `docs/diagnostics.md`, `README.md`, `.specs/codebase/TESTING.md`
- **Done when:** setup, lifecycle, credential storage/rotation, CI overrides, coverage matrix,
  failure behavior, troubleshooting, and parity limits are documented.
- **Gate:** documentation review and link check.

## T8 — Repair documentation links

- **Requirements:** DP-09
- **Status:** Complete
- **Depends on:** T7
- **Files:** only documentation files with failing links and the link-check configuration/script
- **Done when:** the repository link command reports no broken links and fails for a controlled
  broken fixture.
- **Gate:** link check and fixture proof.

## T9 — Run the release-level regression gates

- **Requirements:** DP-10
- **Status:** Complete
- **Depends on:** T6, T7, T8
- **Files:** none unless a regression identifies an in-scope defect
- **Done when:** diagnostics fast/Sonar/aggregate, `test:all`, `build`, and `verify` pass; Docker
  image validation confirms the API image runs as UID 1000 and the web images run as non-root `nginx` (UID 101).
- **Gate:** all commands named above, run serially where shared state requires it.
