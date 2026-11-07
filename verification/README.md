# Automated Verification

`npm run verify` is the release-level critical-flow gate. From a clean checkout it:

1. validates Docker, Compose, Bash, `.env`, and the Compose configuration;
2. removes only the dedicated `process-management-system-verify` Compose project;
3. builds the API image and waits for PostgreSQL health;
4. applies migrations and seeds deterministic demo data;
5. starts the API/load balancer and waits for `/health` to report `UP`;
6. runs the existing curl suite, including negative authentication/RBAC and unpublished-content assertions;
7. asserts lifecycle and audit evidence directly in PostgreSQL; and
8. removes the dedicated containers, network, and volume, even after a failure.

## Prerequisites

- Docker Desktop (or Docker Engine) with `docker compose` available and running.
- Node.js 20 or newer.
- A POSIX Bash shell. On Windows, Git for Windows is detected automatically; set `BASH_PATH` if it is installed elsewhere.
- A repository-root `.env` containing the values described by `.env.example`.
- Verification-only ports `3100` (API) and `55432` (PostgreSQL) available to Docker. Override them with `VERIFY_API_PORT` and `VERIFY_DB_PORT`.

Run the gate from the repository root:

```bash
npm run verify
```

The command is intentionally fail-fast. Its API image uses the separate `process-management-system-api-verify` tag. Generated, redacted request/response captures remain under `verification/logs/backoffice-validation-{timestamp}/`; the database and Compose resources do not.

## Diagnostics and cleanup

Set `VERIFY_KEEP_STACK=1` to retain the dedicated stack after a failure:

```bash
VERIFY_KEEP_STACK=1 npm run verify
```

PowerShell equivalent:

```powershell
$env:VERIFY_KEEP_STACK = '1'
npm run verify
Remove-Item Env:VERIFY_KEEP_STACK
```

Inspect or clean that exact project with:

```bash
docker compose --project-name process-management-system-verify --file docker-compose.yml --file verification/scripts/docker-compose.verify.yml ps
docker compose --project-name process-management-system-verify --file docker-compose.yml --file verification/scripts/docker-compose.verify.yml logs --tail 100 api postgres api-lb
docker compose --project-name process-management-system-verify --file docker-compose.yml --file verification/scripts/docker-compose.verify.yml down --volumes --remove-orphans
```

`VERIFY_COMPOSE_PROJECT` may override the project name using lowercase letters, numbers, underscores, and hyphens. This is useful for isolated local runs; cleanup remains scoped to that exact project.

## Verification artifacts

- `scripts/backoffice_validation_curl_commands.sh` exercises the HTTP critical flows and writes a run-specific runtime env file.
- `scripts/curl_test_lib.sh` captures and sanitizes request/response artifacts.
- `scripts/refresh_db_queries.sh [runtime-env-file]` optionally exports human-readable query evidence while the retained verification stack is running. It honors `VERIFY_COMPOSE_PROJECT`.
- `fixtures/validation-process.bpmn` is the committed BPMN upload fixture.

The runtime env contains only non-sensitive IDs/codes needed to correlate DB evidence. Access tokens and passwords are redacted from generated artifacts.
