# Validation Logs

This directory stores generated request and response captures collected from live validation runs.

- `backoffice-validation-{timestamp}/`
  End-to-end backoffice API validation, including CRUD flows, lifecycle transitions, audit checks, and authorization checks.

## Directory Structure

Each generated run folder typically contains:

- `*.log`
  Human-readable execution log for the full run.
- `*.summary.txt`
  Grouped pass/fail summary for the run.
- `*.runtime.env`
  Exported runtime identifiers captured during the run, limited to the IDs and codes needed by follow-up verification scripts.
- `requests/`
  Per-request captures for the run, with authorization headers, password fields, and login tokens redacted.

## How These Logs Are Produced

These run directories are produced by `../scripts/backoffice_validation_curl_commands.sh`.
The recommended workflow lives in [verification/README.md](../README.md).
