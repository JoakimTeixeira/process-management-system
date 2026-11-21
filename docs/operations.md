# Operations guide

Commands for running, scaling, and resetting the local Docker Compose stack. Run them from the repository root.

## Everyday commands

```bash
# Show the status of every service in the Compose stack.
docker compose ps

# Stream backend logs until you stop the command.
docker compose logs -f api

# Stream PostgreSQL logs until you stop the command.
docker compose logs -f postgres

# Stop and remove the containers, but keep the Postgres data volume and uploaded BPMN files.
docker compose down

# Also delete the Postgres data volume (resets the database, keeps ./api/uploads).
docker compose down -v
```

## Scale the application tier

The exposed URLs stay the same when services are scaled, because the load balancers remain the public entrypoints.

```bash
# API only
docker compose up -d --scale api=2

# Public portal only
docker compose up -d --scale web-public=2

# Backoffice only
docker compose up -d --scale web-backoffice=2

# All three application services
docker compose up -d --scale api=2 --scale web-public=2 --scale web-backoffice=2
```

PostgreSQL stays a single persistent instance, and the application tier scales horizontally.

## Reset local persistent state

The local Docker setup persists data in two places:

- PostgreSQL data in the named Docker volume `pgdata`.
- Uploaded BPMN files in the host folder `./api/uploads`.

On Windows, replace `rm -rf ./api/uploads` with `Remove-Item -Recurse -Force ./api/uploads` in PowerShell, or use Git Bash.

Reset only the database:

```bash
docker compose down -v
docker compose up -d --build
docker compose run --rm api npm run migrate
docker compose run --rm api npm run seed
```

Reset only uploaded BPMN files:

```bash
docker compose down
rm -rf ./api/uploads
docker compose up -d --build
```

Full reset of the database and uploaded files, returning to a clean migrated-and-seeded environment:

```bash
docker compose down -v
rm -rf ./api/uploads
docker compose up -d --build
docker compose run --rm api npm run migrate
docker compose run --rm api npm run seed
```

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| `port is already allocated` on startup | Another process uses `3000`, `8080`, `8081`, or the `DB_PORT` value. Stop it, or change the host port. |
| `migrate` fails to connect | PostgreSQL is not healthy yet. Run `docker compose ps`, wait for `postgres` to report healthy, and retry. |
| Login fails for a seeded user | The seed has not run, or `.env` has a different `DEMO_USER_PASSWORD` than the one used when seeding. Check `.env`, then reseed with the reset steps above. |
| API container keeps restarting | Run `docker compose logs --tail 50 api` and check that `.env` exists and has every variable from `.env.example`. |
