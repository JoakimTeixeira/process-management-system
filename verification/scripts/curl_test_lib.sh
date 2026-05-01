#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$ARTIFACT_ROOT/logs"
mkdir -p "$LOG_DIR"

if [[ -z "${SCRIPT_STEM:-}" ]]; then
  SCRIPT_STEM="validation"
fi

if [[ -z "${RUN_ID:-}" ]]; then
  RUN_ID="$(date -u +%Y%m%d-%H%M%S)"
fi

RUN_DIR="$LOG_DIR/${SCRIPT_STEM}-${RUN_ID}"
REQUESTS_DIR="$RUN_DIR/requests"
mkdir -p "$REQUESTS_DIR"

LOG_FILE="$RUN_DIR/${SCRIPT_STEM}.log"
SUMMARY_FILE="$RUN_DIR/${SCRIPT_STEM}.summary.txt"
RUNTIME_ENV_FILE="$RUN_DIR/${SCRIPT_STEM}.runtime.env"

touch "$LOG_FILE"

declare -ag VALIDATED_SCENARIOS=()
declare -ag FAILURE_DETAILS=()
declare -ag GROUP_ORDER=()
declare -Ag GROUP_LABELS=()
declare -Ag GROUP_ITEMS=()
declare -Ag GROUP_RESULTS=()

REQUEST_COUNTER=0
SCRIPT_FAILED=0
SUMMARY_WRITTEN=0
FAILURE_CLASSIFICATION="N/A"
CURRENT_GROUP_KEY=""

LAST_BODY_FILE=""
LAST_HEADERS_FILE=""
LAST_STATUS=""
LAST_REQUEST_DIR=""
REQUEST_METHOD=""
REQUEST_URL=""
REQUEST_ACCEPT="application/json"
REQUEST_AUTH_PRESENT=0
REQUEST_CONTENT_TYPE=""
REQUEST_BODY_TEXT=""
REQUEST_FORM_TEXT=""
ARTIFACTS_SANITIZED=0

slugify() {
  local value="$1"
  value="${value,,}"
  value="${value// /-}"
  value="${value//\//-}"
  value="${value//:/-}"
  value="${value//[^a-z0-9._-]/}"
  printf '%s' "$value"
}

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

log_line() {
  printf '%s\n' "$*" | tee -a "$LOG_FILE"
}

section() {
  local title="$*"
  local key
  key="$(slugify "$title")"
  CURRENT_GROUP_KEY="$key"

  if [[ -z "${GROUP_LABELS[$key]+x}" ]]; then
    GROUP_ORDER+=("$key")
    GROUP_LABELS["$key"]="$title"
    GROUP_ITEMS["$key"]=""
    GROUP_RESULTS["$key"]="PASS"
  fi

  log_line ""
  log_line "=== $title ==="
}

step() {
  log_line "-- $*"
}

reset_request_metadata() {
  REQUEST_METHOD=""
  REQUEST_URL=""
  REQUEST_ACCEPT="application/json"
  REQUEST_AUTH_PRESENT=0
  REQUEST_CONTENT_TYPE=""
  REQUEST_BODY_TEXT=""
  REQUEST_FORM_TEXT=""
}

record_success() {
  VALIDATED_SCENARIOS+=("$1")

  local group_key="${CURRENT_GROUP_KEY:-ungrouped}"
  if [[ -z "${GROUP_LABELS[$group_key]+x}" ]]; then
    GROUP_ORDER+=("$group_key")
    GROUP_LABELS["$group_key"]="Ungrouped"
    GROUP_ITEMS["$group_key"]=""
    GROUP_RESULTS["$group_key"]="PASS"
  fi

  if [[ -z "${GROUP_ITEMS[$group_key]}" ]]; then
    GROUP_ITEMS["$group_key"]="$1"
  else
    GROUP_ITEMS["$group_key"]+=$'\n'"$1"
  fi
}

record_failure() {
  SCRIPT_FAILED=1
  FAILURE_DETAILS+=("$1")

  local group_key="${CURRENT_GROUP_KEY:-ungrouped}"
  if [[ -z "${GROUP_LABELS[$group_key]+x}" ]]; then
    GROUP_ORDER+=("$group_key")
    GROUP_LABELS["$group_key"]="Ungrouped"
    GROUP_ITEMS["$group_key"]=""
  fi
  GROUP_RESULTS["$group_key"]="FAIL"
}

write_summary() {
  if [[ "$SUMMARY_WRITTEN" -eq 1 ]]; then
    return
  fi

  SUMMARY_WRITTEN=1

  {
    printf 'Run ID: %s\n' "$RUN_ID"
    printf 'Timestamp (UTC): %s\n' "$RUN_ID"
    printf 'Log file: %s\n' "$(to_repo_relative "$LOG_FILE")"
    printf 'Runtime env: %s\n' "$(to_repo_relative "$RUNTIME_ENV_FILE")"
    if [[ "$SCRIPT_FAILED" -eq 0 ]]; then
      printf 'Pass/Fail: PASS\n'
    else
      printf 'Pass/Fail: FAIL\n'
    fi
    printf 'Failure Classification: %s\n' "$FAILURE_CLASSIFICATION"
    printf '\nGrouped results:\n'
    if [[ "${#GROUP_ORDER[@]}" -eq 0 ]]; then
      printf -- '- none recorded\n'
    else
      for group_key in "${GROUP_ORDER[@]}"; do
        printf -- '- %s: %s\n' "${GROUP_LABELS[$group_key]}" "${GROUP_RESULTS[$group_key]:-PASS}"
        if [[ -n "${GROUP_ITEMS[$group_key]}" ]]; then
          while IFS= read -r item; do
            printf '  * %s\n' "$item"
          done <<< "${GROUP_ITEMS[$group_key]}"
        fi
      done
    fi
    printf '\nValidated requests:\n'
    if [[ "${#VALIDATED_SCENARIOS[@]}" -eq 0 ]]; then
      printf -- '- none recorded\n'
    else
      for item in "${VALIDATED_SCENARIOS[@]}"; do
        printf -- '- %s\n' "$item"
      done
    fi
    printf '\nFailed endpoint details:\n'
    if [[ "${#FAILURE_DETAILS[@]}" -eq 0 ]]; then
      printf -- '- none\n'
    else
      for item in "${FAILURE_DETAILS[@]}"; do
        printf -- '- %s\n' "$item"
      done
    fi
  } > "$SUMMARY_FILE"

  log_line ""
  log_line "Summary: $(to_repo_relative "$SUMMARY_FILE")"
}

on_exit() {
  local exit_code=$?

  if [[ "$exit_code" -ne 0 && "${#FAILURE_DETAILS[@]}" -eq 0 ]]; then
    FAILURE_CLASSIFICATION="Application defect"
    record_failure "Script terminated unexpectedly with exit code $exit_code"
  fi

  sanitize_generated_artifacts
  write_summary
}

trap on_exit EXIT

fail_with() {
  local classification="$1"
  local detail="$2"

  FAILURE_CLASSIFICATION="$classification"
  record_failure "$detail"
  log_line "FAIL [$classification] $detail"
  exit 1
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    fail_with "Script mismatch" "Required command '$command_name' is not available."
  fi
}

json_eval_file() {
  local file_path="$1"
  local expression="$2"

  node - "$file_path" "$expression" <<'NODE'
const fs = require('fs');

const filePath = process.argv[2];
const expression = process.argv[3];
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let value;

try {
  value = Function('data', `return (${expression});`)(data);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

if (value === undefined || value === null) {
  process.exit(3);
}

if (typeof value === 'object') {
  process.stdout.write(JSON.stringify(value));
} else {
  process.stdout.write(String(value));
}
NODE
}

json_expect_file() {
  local file_path="$1"
  local expression="$2"
  local message="$3"

  local value
  if ! value="$(json_eval_file "$file_path" "$expression")"; then
    fail_with "Seed/data assumption issue" "$message"
  fi

  printf '%s' "$value"
}

assign_json_value() {
  local variable_name="$1"
  local file_path="$2"
  local expression="$3"
  local message="$4"

  local value
  value="$(json_expect_file "$file_path" "$expression" "$message")"
  printf -v "$variable_name" '%s' "$value"
  export "$variable_name"
}

assert_file_contains() {
  local file_path="$1"
  local needle="$2"
  local message="$3"

  if ! grep -Fq "$needle" "$file_path"; then
    fail_with "Application defect" "$message"
  fi
}

sanitize_json_file() {
  local file_path="$1"
  local mode="$2"

  [[ -f "$file_path" ]] || return

  node - "$file_path" "$mode" <<'NODE'
const fs = require('fs');

const filePath = process.argv[2];
const mode = process.argv[3];
const source = fs.readFileSync(filePath, 'utf8');

let data;
try {
  data = JSON.parse(source);
} catch {
  process.exit(0);
}

const shouldRedact = (key) => {
  const normalized = String(key).toLowerCase();
  if (mode === 'request') {
    return normalized.includes('password');
  }

  return normalized === 'accesstoken'
    || normalized === 'refreshtoken'
    || normalized === 'token';
};

const visit = (value) => {
  if (Array.isArray(value)) {
    return value.map(visit);
  }

  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = shouldRedact(key) ? '<redacted>' : visit(child);
    }
    return next;
  }

  return value;
};

fs.writeFileSync(filePath, `${JSON.stringify(visit(data))}\n`);
NODE
}

sanitize_generated_artifacts() {
  if [[ "$ARTIFACTS_SANITIZED" -eq 1 || ! -d "$RUN_DIR" ]]; then
    return
  fi

  ARTIFACTS_SANITIZED=1

  while IFS= read -r file_path; do
    sanitize_json_file "$file_path" request
  done < <(find "$RUN_DIR/requests" -type f -name 'request.body.json' 2>/dev/null | sort)

  while IFS= read -r file_path; do
    sanitize_json_file "$file_path" response
  done < <(find "$RUN_DIR/requests" -type f -name 'response.body' 2>/dev/null | sort)
}

write_request_artifacts() {
  local request_dir="$1"
  local label="$2"
  local expected_status="$3"

  {
    printf 'Label: %s\n' "$label"
    printf 'Method: %s\n' "$REQUEST_METHOD"
    printf 'URL: %s\n' "$REQUEST_URL"
    printf 'Expected Status: %s\n' "$expected_status"
    printf 'Accept: %s\n' "$REQUEST_ACCEPT"
    if [[ "$REQUEST_AUTH_PRESENT" -eq 1 ]]; then
      printf 'Authorization: Bearer <redacted>\n'
    fi
    if [[ -n "$REQUEST_CONTENT_TYPE" ]]; then
      printf 'Content-Type: %s\n' "$REQUEST_CONTENT_TYPE"
    fi
  } > "$request_dir/request.txt"

  {
    printf 'Accept: %s\n' "$REQUEST_ACCEPT"
    if [[ "$REQUEST_AUTH_PRESENT" -eq 1 ]]; then
      printf 'Authorization: Bearer <redacted>\n'
    fi
    if [[ -n "$REQUEST_CONTENT_TYPE" ]]; then
      printf 'Content-Type: %s\n' "$REQUEST_CONTENT_TYPE"
    fi
  } > "$request_dir/request.headers.txt"

  {
    printf '#!/usr/bin/env bash\n'
    printf 'curl -X %s %q \\\n' "$REQUEST_METHOD" "$REQUEST_URL"
    printf '  -H %q' "Accept: $REQUEST_ACCEPT"
    if [[ "$REQUEST_AUTH_PRESENT" -eq 1 ]]; then
      printf ' \\\n  -H %q' 'Authorization: Bearer <redacted>'
    fi
    if [[ -n "$REQUEST_CONTENT_TYPE" ]]; then
      printf ' \\\n  -H %q' "Content-Type: $REQUEST_CONTENT_TYPE"
    fi
    if [[ -n "$REQUEST_BODY_TEXT" ]]; then
      printf ' \\\n  --data @request.body.json'
    fi
    if [[ -n "$REQUEST_FORM_TEXT" ]]; then
      while IFS= read -r line; do
        printf ' \\\n  %s' "$line"
      done <<< "$REQUEST_FORM_TEXT"
    fi
    printf '\n'
  } > "$request_dir/request.curl.sh"

  if [[ -n "$REQUEST_BODY_TEXT" ]]; then
    printf '%s\n' "$REQUEST_BODY_TEXT" > "$request_dir/request.body.json"
  fi

  if [[ -n "$REQUEST_FORM_TEXT" ]]; then
    printf '%s\n' "$REQUEST_FORM_TEXT" > "$request_dir/request.form.txt"
  fi
}

capture_request() {
  local label="$1"
  local expected_status="$2"
  shift 2

  REQUEST_COUNTER=$((REQUEST_COUNTER + 1))

  local request_id
  request_id="$(printf '%03d_%s' "$REQUEST_COUNTER" "$(slugify "$label")")"

  local request_dir="$REQUESTS_DIR/$request_id"
  mkdir -p "$request_dir"

  write_request_artifacts "$request_dir" "$label" "$expected_status"

  local body_file="$request_dir/response.body"
  local headers_file="$request_dir/response.headers"

  set +e
  local status
  status="$(curl -sS -D "$headers_file" -o "$body_file" -w '%{http_code}' "$@")"
  local curl_exit=$?
  set -e

  LAST_BODY_FILE="$body_file"
  LAST_HEADERS_FILE="$headers_file"
  LAST_STATUS="$status"
  LAST_REQUEST_DIR="$request_dir"

  reset_request_metadata

  if [[ "$curl_exit" -ne 0 ]]; then
    fail_with "Script mismatch" "$label failed because curl exited with code $curl_exit."
  fi

  log_line "[$request_id] $label -> HTTP $status"

  if [[ "$status" != "$expected_status" ]]; then
    local preview
    preview="$(head -c 500 "$body_file" | tr '\r\n' ' ' || true)"
    fail_with \
      "Application defect" \
      "$label expected HTTP $expected_status but received HTTP $status. Response preview: $preview"
  fi

  record_success "$label"
}

get_request() {
  local label="$1"
  local expected_status="$2"
  local url="$3"
  local token="${4:-}"
  local accept_header="${5:-application/json}"

  REQUEST_METHOD="GET"
  REQUEST_URL="$url"
  REQUEST_ACCEPT="$accept_header"
  REQUEST_AUTH_PRESENT=0

  local -a args=(-X GET "$url" -H "Accept: $accept_header")
  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer $token")
    REQUEST_AUTH_PRESENT=1
  fi

  capture_request "$label" "$expected_status" "${args[@]}"
}

delete_request() {
  local label="$1"
  local expected_status="$2"
  local url="$3"
  local token="$4"

  REQUEST_METHOD="DELETE"
  REQUEST_URL="$url"
  REQUEST_ACCEPT="application/json"
  REQUEST_AUTH_PRESENT=1

  capture_request \
    "$label" \
    "$expected_status" \
    -X DELETE \
    "$url" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $token"
}

post_json() {
  local label="$1"
  local expected_status="$2"
  local url="$3"
  local token="$4"
  local payload="$5"

  REQUEST_METHOD="POST"
  REQUEST_URL="$url"
  REQUEST_ACCEPT="application/json"
  REQUEST_AUTH_PRESENT=0
  REQUEST_CONTENT_TYPE="application/json"
  REQUEST_BODY_TEXT="$payload"

  local -a args=(
    -X POST
    "$url"
    -H "Accept: application/json"
    -H "Content-Type: application/json"
    --data "$payload"
  )

  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer $token")
    REQUEST_AUTH_PRESENT=1
  fi

  capture_request "$label" "$expected_status" "${args[@]}"
}

patch_json() {
  local label="$1"
  local expected_status="$2"
  local url="$3"
  local token="$4"
  local payload="$5"

  REQUEST_METHOD="PATCH"
  REQUEST_URL="$url"
  REQUEST_ACCEPT="application/json"
  REQUEST_AUTH_PRESENT=0
  REQUEST_CONTENT_TYPE="application/json"
  REQUEST_BODY_TEXT="$payload"

  local -a args=(
    -X PATCH
    "$url"
    -H "Accept: application/json"
    -H "Content-Type: application/json"
    --data "$payload"
  )

  if [[ -n "$token" ]]; then
    args+=(-H "Authorization: Bearer $token")
    REQUEST_AUTH_PRESENT=1
  fi

  capture_request "$label" "$expected_status" "${args[@]}"
}

post_form_file() {
  local label="$1"
  local expected_status="$2"
  local url="$3"
  local token="$4"
  local file_path="$5"
  local caption="$6"

  REQUEST_METHOD="POST"
  REQUEST_URL="$url"
  REQUEST_ACCEPT="application/json"
  REQUEST_AUTH_PRESENT=1
  local display_file_path
  display_file_path="$(to_repo_relative "$file_path")"
  printf -v REQUEST_FORM_TEXT '%s\n%s' "-F \"file=@$display_file_path\"" "-F \"caption=$caption\""

  capture_request \
    "$label" \
    "$expected_status" \
    -X POST \
    "$url" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $token" \
    -F "file=@$file_path" \
    -F "caption=$caption"
}

login_and_load_profile() {
  local alias_name="$1"
  local email="$2"
  local password="$3"
  local base_url="$4"

  local payload
  payload="$(printf '{"email":"%s","password":"%s"}' "$email" "$password")"

  post_json "Auth login for $alias_name" 201 "$base_url/auth/login" "" "$payload"

  local token
  token="$(json_expect_file "$LAST_BODY_FILE" "data.accessToken" "Unable to extract access token for $alias_name login.")"
  printf -v "${alias_name}_TOKEN" '%s' "$token"
  export "${alias_name}_TOKEN"

  get_request "Auth profile for $alias_name" 200 "$base_url/auth/me" "$token"

  assign_json_value "${alias_name}_USER_ID" "$LAST_BODY_FILE" "data.id" "Unable to resolve user id for $alias_name."
  assign_json_value "${alias_name}_ROLE_NAME" "$LAST_BODY_FILE" "data.role.name" "Unable to resolve role for $alias_name."
  assign_json_value "${alias_name}_TEAM_ID" "$LAST_BODY_FILE" "data.team.id" "Unable to resolve team id for $alias_name."
  assign_json_value "${alias_name}_TEAM_CODE" "$LAST_BODY_FILE" "data.team.code" "Unable to resolve team code for $alias_name."
  assign_json_value "${alias_name}_TEAM_NAME" "$LAST_BODY_FILE" "data.team.name" "Unable to resolve team name for $alias_name."
}

write_runtime_env() {
  local output_file="$RUNTIME_ENV_FILE"

  {
    printf 'RUN_ID=%s\n' "$RUN_ID"
    printf 'RUN_DIR=%s\n' "$(to_repo_relative "$RUN_DIR")"
    printf 'LOG_FILE=%s\n' "$(to_repo_relative "$LOG_FILE")"
    printf 'SUMMARY_FILE=%s\n' "$(to_repo_relative "$SUMMARY_FILE")"
    printf 'REQUESTS_DIR=%s\n' "$(to_repo_relative "$REQUESTS_DIR")"
    while IFS='=' read -r key value; do
      printf '%s=%q\n' "$key" "$value"
    done < <(env | grep -E '^(API_BASE_URL|PUBLIC_BASE_URL|.*_USER_ID|.*_TEAM_ID|.*_TEAM_CODE|.*_ID|.*_CODE)=' | grep -Ev '^(CODEX_THREAD_ID)=' | sort)
  } > "$output_file"
}
