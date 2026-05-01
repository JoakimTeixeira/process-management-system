#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DB_QUERY_DIR="$ARTIFACT_ROOT/db_queries"
LOGS_DIR="$ARTIFACT_ROOT/logs"
LEGACY_LOGS_DIR="$SCRIPT_DIR/logs"
DEFAULT_RUNTIME_ENV=""

to_repo_relative() {
  local value="$1"

  if [[ -z "$value" ]]; then
    printf '%s' "$value"
    return
  fi

  if [[ "$value" == "$REPO_ROOT" ]]; then
    printf '.'
    return
  fi

  if [[ "$value" == "$REPO_ROOT/"* ]]; then
    printf '%s' "${value#"$REPO_ROOT/"}"
    return
  fi

  printf '%s' "$value"
}

find_latest_runtime_env() {
  local latest_file=""

  if [[ -d "$LOGS_DIR" ]]; then
    latest_file="$(find "$LOGS_DIR" -maxdepth 2 -type f -name 'backoffice-validation.runtime.env' | sort | tail -n 1 || true)"
  fi

  if [[ -z "$latest_file" && -d "$LEGACY_LOGS_DIR" ]]; then
    latest_file="$(find "$LEGACY_LOGS_DIR" -maxdepth 2 -type f -name 'backoffice-validation.runtime.env' | sort | tail -n 1 || true)"
  fi

  if [[ -n "$latest_file" ]]; then
    printf '%s' "$latest_file"
  fi
}

if [[ $# -gt 0 ]]; then
  DEFAULT_RUNTIME_ENV="$1"
else
  DEFAULT_RUNTIME_ENV="$(find_latest_runtime_env)"
fi

if [[ -z "$DEFAULT_RUNTIME_ENV" || ! -f "$DEFAULT_RUNTIME_ENV" ]]; then
  printf 'Unable to resolve a backoffice validation runtime env file.\n' >&2
  printf 'Usage: %s [path-to-backoffice-validation.runtime.env]\n' "${BASH_SOURCE[0]}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$DEFAULT_RUNTIME_ENV"

: "${WORKFLOW_REOPEN_VERSION_ID:?Expected WORKFLOW_REOPEN_VERSION_ID in runtime env.}"
: "${TEMP_USER_ID:?Expected TEMP_USER_ID in runtime env.}"

run_psql_to_file() {
  local sql="$1"
  local output_file="$2"

  docker compose exec -T postgres \
    psql -U postgres -d process_management_system -c "$sql" \
    > "$output_file"
}

cat > "$DB_QUERY_DIR/README.md" <<EOF
# Database Query Outputs

This directory contains SQL query outputs generated during verification runs.

## Query Instructions

### DB-01: Version State History

Query to retrieve lifecycle state transitions for the refreshed reopen verification version:

\`\`\`sql
SELECT
    process_version_id,
    from_state,
    to_state,
    reason,
    actor_id,
    created_at
FROM version_state_history
WHERE process_version_id = '$WORKFLOW_REOPEN_VERSION_ID'
ORDER BY created_at ASC;
\`\`\`

### DB-02: Process Version Audit Logs

Query to retrieve audit logs for the same reopen verification version:

\`\`\`sql
SELECT
    entity_type,
    entity_id,
    action,
    actor_id,
    reason_for_change,
    created_at
FROM audit_logs
WHERE entity_type = 'process_version'
  AND entity_id = '$WORKFLOW_REOPEN_VERSION_ID'
ORDER BY created_at ASC;
\`\`\`

### DB-03: User Audit Logs

Query to retrieve audit logs for the refreshed user-administration verification flow:

\`\`\`sql
SELECT
    entity_type,
    entity_id,
    action,
    actor_id,
    reason_for_change,
    created_at
FROM audit_logs
WHERE entity_type = 'user'
  AND entity_id = '$TEMP_USER_ID'
ORDER BY created_at ASC;
\`\`\`

## Usage

Run these queries against the PostgreSQL database after executing the verification capture script to export the matching audit trail data.
EOF

run_psql_to_file \
  "SELECT process_version_id, from_state, to_state, reason, actor_id, created_at FROM version_state_history WHERE process_version_id = '$WORKFLOW_REOPEN_VERSION_ID' ORDER BY created_at ASC;" \
  "$DB_QUERY_DIR/DB-01_version_state_history.txt"

run_psql_to_file \
  "SELECT entity_type, entity_id, action, actor_id, reason_for_change, created_at FROM audit_logs WHERE entity_type = 'process_version' AND entity_id = '$WORKFLOW_REOPEN_VERSION_ID' ORDER BY created_at ASC;" \
  "$DB_QUERY_DIR/DB-02_process_version_audit_logs.txt"

run_psql_to_file \
  "SELECT entity_type, entity_id, action, actor_id, reason_for_change, created_at FROM audit_logs WHERE entity_type = 'user' AND entity_id = '$TEMP_USER_ID' ORDER BY created_at ASC;" \
  "$DB_QUERY_DIR/DB-03_user_audit_logs.txt"

printf 'Updated database verification from %s\n' "$(to_repo_relative "$DEFAULT_RUNTIME_ENV")"
printf '  - %s\n' "$(to_repo_relative "$DB_QUERY_DIR/DB-01_version_state_history.txt")"
printf '  - %s\n' "$(to_repo_relative "$DB_QUERY_DIR/DB-02_process_version_audit_logs.txt")"
printf '  - %s\n' "$(to_repo_relative "$DB_QUERY_DIR/DB-03_user_audit_logs.txt")"
printf '  - %s\n' "$(to_repo_relative "$DB_QUERY_DIR/README.md")"
