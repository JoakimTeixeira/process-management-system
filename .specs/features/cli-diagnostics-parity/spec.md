# CLI Diagnostics Parity

## Goal

Expose all project-wide TypeScript, ESLint, and free SonarQube Community Build findings through
deterministic CLI commands without requiring files to be opened in VS Code.

## Requirements

- **DP-01 Fast diagnostics:** `npm run diagnostics:fast` checks relevant root, API, public, and
  backoffice TypeScript, JavaScript, templates, tests, and tooling files. ESLint warnings fail the
  command.
- **DP-02 SonarQube diagnostics:** `npm run diagnostics:sonar` performs an authenticated full
  analysis, waits for compute-engine completion, prints every unresolved issue and unreviewed
  hotspot with its source location and rule identifier, and fails for findings or infrastructure
  errors.
- **DP-03 Aggregate diagnostics:** `npm run diagnostics` runs both layers, reports every practical
  failure, and never silently skips SonarQube.
- **DP-04 Local infrastructure:** a pinned, free SonarQube Community Build service runs as the
  optional `diagnostics` profile in the main Compose project and preserves local data between runs.
- **DP-05 Secret handling:** generated local credentials remain outside Git in restricted files;
  CI and manual runs may override them with environment variables; diagnostic output never prints
  a credential.
- **DP-06 Editor alignment:** VS Code ESLint working directories and SonarQube Connected Mode point
  at the same workspace projects and SonarQube project key used by the CLI.
- **DP-07 Regression proof:** executable fixtures prove Docker `docker:S6471`, an independent
  Sonar TypeScript rule, ESLint warning/error handling, TypeScript errors, root/test/uncommitted
  coverage, pagination, timeout, authentication, scanner/configuration failures, and clean runs.
- **DP-08 Documentation:** contributor documentation covers commands, coverage, credentials,
  lifecycle, troubleshooting, and the limits of IDE/CLI parity.
- **DP-09 Link integrity:** repository documentation link checks complete without broken internal
  or external references.
- **DP-10 Compatibility:** existing unit, integration, contract, e2e, build, browser, and release
  verification workflows remain functional.

## Constraints

- Use free, maintained tooling only.
- Do not weaken analyzer rules or add blanket suppressions.
- Analyze saved and uncommitted files without relying on editor state.
- Preserve the platform conformance behavior traced to commit `8784c1d`.
- Keep each implementation topic in an independently verified atomic commit.

## Known parity boundary

Connected Mode synchronizes server-side quality profiles and project association, but the IDE and
scanner still have different execution triggers and may bundle different analyzer versions. The
project therefore guarantees comprehensive CLI coverage for configured analyzers, not byte-for-byte
identity with every editor-only language-service suggestion.
