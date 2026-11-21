# Development guide

Day-to-day development tasks for the Process Management System. For a first run of the stack, use the [Quick start](../README.md#quick-start) in the README.

## Prerequisites

- Docker Desktop with `docker compose`
- Node.js 22+ and npm 10+
- Git Bash on Windows, or another POSIX-style shell (required by `npm run verify`)
- PostgreSQL 16+, only if you do not want to use the Compose `postgres` service

## Run the apps with hot reload

Hot reload runs the API and both Angular dev servers on your machine and uses PostgreSQL from Docker or your own installation.

1. Create the root environment file:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL. This command starts only the database from the Compose file and publishes it on `DB_PORT` (default `5431`):

   ```bash
   docker compose up -d postgres
   ```

   If you use your own PostgreSQL instead, make sure it matches the `DB_*` values in `.env`.

3. Start everything with one command:

   ```bash
   npm run start:all
   ```

   This installs dependencies, then starts the API (<http://localhost:3000>), the public portal, and the backoffice.

4. In another terminal, prepare the database:

   ```bash
   cd api
   npm run migrate
   npm run seed
   ```

To run each app in its own terminal instead, install dependencies once and then start the apps from their folders:

```bash
cd api && npm install
cd ../web/backoffice && npm install
cd ../public && npm install
```

| Package | Run | Test | Lint |
| --- | --- | --- | --- |
| `api` | `npm run start:dev` | `npm test` | `npm run lint` |
| `web/public` | `npm start` | `npm run test:headless` | `npm run lint` |
| `web/backoffice` | `npm start` | `npm run test:headless` | `npm run lint` |

Run these commands from inside each package folder. When the Angular dev servers run on their own ports, the frontends call the API at <http://localhost:3000>.

## Rebuild Docker images after code changes

The Docker setup does not hot-reload. Rebuild the affected service after changing code:

```bash
# Everything
docker compose up -d --build

# Only the API
docker compose build api
docker compose up -d api api-lb

# Only the public portal
docker compose build web-public
docker compose up -d web-public public-lb

# Only the backoffice
docker compose build web-backoffice
docker compose up -d web-backoffice backoffice-lb
```

After a schema change, rebuild the API and run `docker compose run --rm api npm run migrate`. After a seed-data change, rebuild the API and run `docker compose run --rm api npm run seed`.

## Create a migration

Create a migration whenever you change the database schema or need a controlled data fix that must be applied consistently across environments.

This repository uses manual migrations. The TypeORM CLI datasource does not register entity metadata for auto-generation, so `migration:generate` is not the normal workflow. Create an empty migration and write the SQL or TypeORM statements yourself:

```bash
cd api
npm run typeorm -- migration:create ./migrations/DescribeChangeHere
```

Then:

1. Review the new file under `api/migrations/`.
2. Rebuild the API if you are using Docker.
3. Apply it with `npm run migrate` locally or `docker compose run --rm api npm run migrate` in Docker.
4. Reseed only if your change requires refreshed local demo data.

Other migration commands, run inside `api/`: `npm run migrate:show` and `npm run migrate:revert`.

If you later wire the CLI datasource to include entity metadata, `npm run typeorm -- migration:generate ./migrations/DescribeChangeHere -d src/database/typeorm.datasource.ts` becomes available.

## Test and quality commands

The test pyramid and gate commands are defined in [.specs/codebase/TESTING.md](../.specs/codebase/TESTING.md). From a fresh clone, install the locked dependencies first:

```bash
npm ci
npm ci --prefix api
npm ci --prefix web/backoffice
npm ci --prefix web/public
npm run test:browser:install
```

| Command | Purpose |
| --- | --- |
| `npm run test:unit` | Run all API, public, and backoffice Vitest unit suites. |
| `npm run test:integration` | Run isolated PostgreSQL integration tests. Do not run concurrently with another integration suite. |
| `npm run test:contract` | Check OpenAPI, generated types, schemas, and frontend fixtures. |
| `npm run test:e2e` | Run the API bootstrap and `/health` Supertest smoke. |
| `npm run test:all` | Run all non-release test layers. |
| `npm run test:browser` | Run public and backoffice entry-route smokes in Chromium. |
| `npm run test:mutation --prefix api` | Run the scoped, non-blocking Stryker pilot. |
| `npm run lint` | Run read-only ESLint with zero warnings and the backoffice module audit. |
| `npm run typecheck` | Type-check application and test TypeScript across all packages. |
| `npm run build` | Build all three packages. |
| `npm run verify` | Run the release-level Compose, curl, and database gate. |

`npm run verify` owns an isolated Compose project, applies migrations, seeds deterministic data, exercises the critical curl, RBAC, and visibility flows, asserts database evidence, and cleans up. Run `npm run build` and `npm run verify` before a release handoff.

## Diagnostics and SonarQube

| Command | Purpose |
| --- | --- |
| `npm run diagnostics:fast` | TypeScript, strict ESLint/SonarJS, module, and internal-link checks, without SonarQube. |
| `npm run diagnostics:sonar` | Generate coverage, then run the authenticated full-project SonarQube scan and result retrieval. |
| `npm run diagnostics` | Run `diagnostics:fast` plus the full SonarQube scan, print every unresolved issue, and fail on warnings or errors. |
| `npm run sonar:check` | Scan all supported languages and print unresolved SonarQube issues and hotspots as CLI file/line diagnostics. |
| `npm run sonar:start` / `sonar:stop` | Start or stop the optional local SonarQube service while preserving its data volumes. |
| `npm run test:diagnostics` | Prove analyzer coverage and failure handling with controlled fixtures. |

To run the full gate locally:

```bash
npm run sonar:start
npm run diagnostics
```

Local SonarQube credentials are generated under the ignored `.sonarqube/` directory rather than the application `.env`. CI should provide `SONAR_TOKEN` from its encrypted secret store. To use VS Code Connected Mode, bind it to <http://localhost:9000> and project key `process-management-system`. The [diagnostics guide](diagnostics.md) documents credential rotation, environment overrides, coverage, failure categories, and the limits of IDE/CLI parity.
