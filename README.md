# Process Management System

COBIT-guided process management system.

## Prerequisites

- Docker Desktop with `docker compose`
- Node.js 20+
- npm 10+
- Git Bash on Windows, or another POSIX-style shell

For direct local development without Docker you will also need:

- PostgreSQL 16+
- Google Chrome or Chromium for the Angular headless test runners

## Overview

The system is split into four runtime concerns:

- `postgres`: persistent relational database
- `api`: NestJS backend with JWT auth, RBAC, workflow rules, Swagger, audit trail, and public catalog endpoints
- `web-public`: Angular public portal for published processes, procedures, glossary, and BPMN viewing
- `web-backoffice`: Angular backoffice for authenticated governance and administration

In Docker, the application tier is exposed through Nginx load balancers:

- `api-lb` on `http://localhost:3000`
- `public-lb` on `http://localhost:8080`
- `backoffice-lb` on `http://localhost:8081`

The application services run on the internal Docker network and can be scaled horizontally. PostgreSQL remains a single persistent instance backed by the named volume `pgdata`.

## Repository Structure

```text
process-management-system/
├── api/                     NestJS backend
├── web/public/              Angular public portal
├── web/backoffice/          Angular backoffice
├── docker/                  Nginx load balancer configs
├── docs/                    Supporting project documentation
├── .env.example             Root environment template
└── docker-compose.yml       Local container orchestration
```

## Main Capabilities

### API

- JWT login and protected backoffice routes
- Role-based access control for governance actions
- CRUD flows for users, teams, glossary, areas, processes, versions, assets, and procedures
- Workflow transitions for process versions
- Audit log and version state history tracking
- Public catalog endpoints under `/public/*`
- Swagger UI at `/docs`
- Health endpoint at `/health`

### Public Portal

- Browse published areas, processes, and procedures
- Search published content
- View process details and published versions
- View BPMN diagrams
- Compare current and target-state content
- Browse glossary and supporting informational pages

### Backoffice

- Login with seeded or managed users
- Manage teams and users
- Create and update governed content
- Upload BPMN assets
- Move versions through lifecycle states
- Review version history and governance metadata

## Local Docker Run

1. Create the local environment file:

```bash
cp .env.example .env
```

2. Validate the Compose file:

```bash
docker compose config
```

3. Build and start the stack:

```bash
docker compose up -d --build
```

4. Run controlled schema and data bootstrap:

```bash
docker compose run --rm api npm run migrate
docker compose run --rm api npm run seed
```

5. Confirm the running services:

```bash
docker compose ps
```

### Default URLs

- API health: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`
- OpenAPI YAML: `http://localhost:3000/docs-yaml`
- Public portal: `http://localhost:8080`
- Back office: `http://localhost:8081`
- PostgreSQL: `http://localhost:5432`

### Seeded Users

After `npm run seed`, these users are available with the password stored in `DEMO_USER_PASSWORD`:

- `alice.editor@example.com` - `EDITOR`
- `rachel.reviewer@example.com` - `REVIEWER`
- `peter.publisher@example.com` - `PUBLISHER`
- `victor.viewer@example.com` - `VIEWER`
- `sam.admin@example.com` - `SYSTEM_ADMIN`

## Rebuilding After Code Changes

This setup does not hot-reload container images. After code changes, rebuild the affected service.

### Rebuild the full stack

```bash
docker compose up -d --build
```

### Rebuild only the API

```bash
docker compose build api
docker compose up -d api api-lb
```

### Rebuild only the public portal

```bash
docker compose build web-public
docker compose up -d web-public public-lb
```

### Rebuild only the backoffice

```bash
docker compose build web-backoffice
docker compose up -d web-backoffice backoffice-lb
```

### When schema changes

```bash
docker compose build api
docker compose up -d api api-lb
docker compose run --rm api npm run migrate
```

### When seed data changes

```bash
docker compose build api
docker compose up -d api api-lb
docker compose run --rm api npm run seed
```

## Creating Migrations

Create a migration whenever you change the database schema or need a controlled data fix that must be applied consistently across environments.

This repository currently uses manual migrations. The TypeORM CLI datasource used for migrations does not register entity metadata for auto-generation, so `migration:generate` is not the normal workflow here.

Create an empty migration file and then write the SQL or TypeORM statements manually:

```bash
cd api
npm run typeorm -- migration:create ./migrations/DescribeChangeHere
```

If you intentionally wire the CLI datasource to include entity metadata in the future, you can then use:

```bash
cd api
npm run typeorm -- migration:generate ./migrations/DescribeChangeHere -d src/database/typeorm.datasource.ts
```

After creating a migration:

1. Review the generated file under `api/migrations/`.
2. Rebuild the API if you are using Docker.
3. Apply the migration with `npm run migrate` locally or `docker compose run --rm api npm run migrate` in Docker.
4. Reseed only if your change requires refreshed local demo data.

Useful migration commands:

```bash
cd api
npm run migrate
npm run migrate:show
npm run migrate:revert
```

## Scaling the Application Tier

The exposed URLs stay the same even when services are scaled because the load balancers remain the public entrypoints.

### Scale the API

```bash
docker compose up -d --scale api=2
```

### Scale the public portal

```bash
docker compose up -d --scale web-public=2
```

### Scale the backoffice

```bash
docker compose up -d --scale web-backoffice=2
```

### Scale all three application services

```bash
docker compose up -d --scale api=2 --scale web-public=2 --scale web-backoffice=2
```

PostgreSQL is intentionally not scaled with the same pattern. It remains a single persistent instance, while the application tier demonstrates horizontal scalability.

## Useful Operations

```bash
# Show the current status of every service in the Compose stack.
docker compose ps

# Stream backend logs until you stop the command.
docker compose logs -f api

# Stream PostgreSQL logs until you stop the command.
docker compose logs -f postgres

# Stop and remove the containers, but keep the Postgres data volume and uploaded BPMN files.
docker compose down

# Stop and remove the containers and also delete the Postgres data volume.
# This resets the database, but it does not delete uploaded BPMN files in ./api/uploads.
docker compose down -v
```

## Resetting Local Persistent State

The local Docker setup persists data in two places:

- PostgreSQL data is stored in the named Docker volume `pgdata`.
- Uploaded BPMN files are stored in the host folder `./api/uploads`.

Reset only the database:

```bash
docker compose down -v
docker compose up -d --build
docker compose run --rm api npm run migrate
docker compose run --rm api npm run seed
```

Reset only uploaded BPMN asset files:

```bash
docker compose down
rm -rf ./api/uploads
docker compose up -d --build
```

Full local reset of database and uploaded BPMN files:

```bash
docker compose down -v
rm -rf ./api/uploads
docker compose up -d --build
docker compose run --rm api npm run migrate
docker compose run --rm api npm run seed
```

Use the full reset when you need to discard all local persisted state and return to a clean migrated-and-seeded environment.

## Development Without Docker

Install dependencies first:

```bash
cd api && npm install
cd ../web/backoffice && npm install
cd ../public && npm install
```

You can then run the apps directly from their project folders:

- `api`: `npm run start:dev`
- `web/public`: `npm start`
- `web/backoffice`: `npm start`

For direct local development:

1. Create a root `.env` from `.env.example`.
2. Make sure PostgreSQL is running and matches the root `.env` values.
3. In `api/`, run:

```bash
npm run migrate
npm run seed
npm run start:dev
```

4. In separate terminals, run:

```bash
cd web/public && npm start
cd web/backoffice && npm start
```

The frontend API base-url helpers use `http://localhost:3000` when the Angular dev servers are running on their own ports.

## Common Commands

### API

```bash
cd api
npm run start:dev
npm test
npm run lint
npm run migrate
npm run seed
```

### Backoffice

```bash
cd web/backoffice
npm start
npm run test:headless
npm run lint
```

### Public Portal

```bash
cd web/public
npm start
npm run test:headless
npm run lint
```

## Verification

Quick checks after setup:

```bash
docker compose ps
docker compose logs --tail 50 api
```

Or validate the key URLs directly:

- `http://localhost:3000/health`
- `http://localhost:3000/docs`
- `http://localhost:3000/docs-json`
- `http://localhost:3000/docs-yaml`
- `http://localhost:8080`
- `http://localhost:8081`
