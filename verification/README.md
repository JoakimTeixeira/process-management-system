# Verification Assets

This directory contains reusable verification scripts and the generated outputs they produce.

- [scripts](scripts)
  Verification runners and shared shell helpers.
- [fixtures](fixtures)
  Static files used by the verification scripts, such as a BPMN upload sample.
- [logs](logs)
  Generated request and response captures from verification runs.
- [db_queries](db_queries)
  Generated PostgreSQL query exports tied to a verification run.

Generated logs and query exports can be refreshed at any time from the scripts in `verification/scripts/`.

The BPMN fixture in `verification/fixtures/` is intentionally committed so the backoffice verification flow can exercise asset upload end to end without relying on a developer to provide a local file at runtime.

## Recommended Workflow

1. `scripts/backoffice_validation_curl_commands.sh`
   Runs the end-to-end backoffice verification flow and writes a new run directory to `logs/backoffice-validation-{timestamp}/`.
   That run directory includes a `backoffice-validation.runtime.env` file containing the non-sensitive IDs and codes created or resolved during that specific run.
2. `scripts/refresh_db_queries.sh`
   Connects to the live PostgreSQL database inside the Docker `postgres` container and rewrites the outputs in `db_queries/`.
   It uses `backoffice-validation.runtime.env` only to know which run-specific IDs to query.

Typical refresh flow:

```bash
./scripts/backoffice_validation_curl_commands.sh
./scripts/refresh_db_queries.sh
```

## Notes

- Generated verification runs are gitignored and intended to be refreshed locally rather than committed.
- `scripts/refresh_db_queries.sh` can be pointed at a specific `backoffice-validation.runtime.env` file when a particular capture run must be reused.
- The live Docker database is the source of truth for verification data. `backoffice-validation.runtime.env` is only a lookup file for the run-specific IDs.
- If the BPMN fixture is ever removed, the backoffice verification script will need to either generate a temporary BPMN file or skip BPMN upload coverage.
- Additional capture scripts can be added later if the verification scope expands.
