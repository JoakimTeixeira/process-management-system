# Database Query Outputs

This directory contains SQL query outputs generated from the live PostgreSQL database running inside the Docker `postgres` container.

These files are produced by executing SQL against the live database after a successful verification run.
They are not copied from the verification logs.

## Query Instructions

### DB-01: Version State History

Query to retrieve lifecycle state transitions for the refreshed reopen verification version:

```sql
SELECT
    process_version_id,
    from_state,
    to_state,
    reason,
    actor_id,
    created_at
FROM version_state_history
WHERE process_version_id = 'e91b4a8d-ec55-42bf-a826-8d2de59bf634'
ORDER BY created_at ASC;
```

### DB-02: Process Version Audit Logs

Query to retrieve audit logs for the same reopen verification version:

```sql
SELECT
    entity_type,
    entity_id,
    action,
    actor_id,
    reason_for_change,
    created_at
FROM audit_logs
WHERE entity_type = 'process_version'
  AND entity_id = 'e91b4a8d-ec55-42bf-a826-8d2de59bf634'
ORDER BY created_at ASC;
```

### DB-03: User Audit Logs

Query to retrieve audit logs for the refreshed user-administration verification flow:

```sql
SELECT
    entity_type,
    entity_id,
    action,
    actor_id,
    reason_for_change,
    created_at
FROM audit_logs
WHERE entity_type = 'user'
  AND entity_id = '467f08e8-1102-413f-8789-caacb146e4ba'
ORDER BY created_at ASC;
```

## Usage

These files are produced by `../scripts/refresh_db_queries.sh`.
The recommended workflow and the explanation of `backoffice-validation.runtime.env` live in [verification/README.md](../README.md).
