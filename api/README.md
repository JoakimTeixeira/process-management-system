# API

NestJS backend for the Process Management System.

## Responsibilities

- JWT authentication and current-user lookup
- Role-based access control for protected endpoints
- Governance workflows for process versions
- CRUD endpoints for users, teams, glossary, areas, processes, procedures, and assets
- Public read-only catalog endpoints under `/public`
- Audit trail and version state history
- Swagger/OpenAPI documentation

## Main Endpoints

- `POST /auth/login`
- `GET /auth/me`
- `GET /health`
- `GET /docs`
- `GET /public/areas`
- `GET /public/processes`
- `GET /public/processes/:processId`
- `GET /public/processes/:processId/versions`
- `GET /public/process-versions/:id/bpmn`
- `GET /public/procedures`
- `GET /public/procedures/:id`
- `GET /public/search`

## Local Development

Install dependencies:

```bash
npm install
```

Start in watch mode:

```bash
npm run start:dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

### Mutation pilot

Run the scoped Stryker pilot:

```bash
npm run test:mutation
```

The pilot mutates `HealthService` and `WorkflowAuthorizationService` and uses their 13 focused
Vitest tests. It writes local HTML and JSON reports under `reports/mutation/`; generated reports are
ignored by Git. The threshold uses `break: null`, so mutation survivors are visible but do not fail
the build while the pilot remains opt-in.

Baseline on 2026-11-08: 33 mutants killed, 0 survived, 0 uncovered, 0 timed out, and 0 errored
(100% mutation score). There are no survivors to triage at this scope; expand the `mutate` and
`testFiles` lists together when adopting another service.

## Database Workflows

The backend uses explicit migrations and manual seeding.

Run migrations:

```bash
npm run migrate
```

Seed the database:

```bash
npm run seed
```

Revert the last migration:

```bash
npm run migrate:revert
```

## Docker Runtime Notes

Inside Docker Compose:

- the API service is internal-only
- `api-lb` exposes the backend on `http://localhost:3000`
- the API waits for PostgreSQL to become healthy
- BPMN uploads persist through `./api/uploads:/app/uploads`

Swagger and health remain available through the load balancer:

- `http://localhost:3000/docs`
- `http://localhost:3000/health`

## Configuration

The API loads environment values from the root `.env` file. Important variables include:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PASSWORD_PEPPER`
- `DEMO_PASSWORD`
