#!/usr/bin/env bash

set -euo pipefail

SCRIPT_STEM="backoffice-validation"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Stable configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-$API_BASE_URL/public}"
DEMO_USER_PASSWORD="${DEMO_USER_PASSWORD:-ProcessSeed!2026}"
EDITOR_EMAIL="${EDITOR_EMAIL:-alice.editor@example.com}"
REVIEWER_EMAIL="${REVIEWER_EMAIL:-rachel.reviewer@example.com}"
PUBLISHER_EMAIL="${PUBLISHER_EMAIL:-peter.publisher@example.com}"
ADMIN_EMAIL="${ADMIN_EMAIL:-sam.admin@example.com}"
VIEWER_EMAIL="${VIEWER_EMAIL:-victor.viewer@example.com}"
SEED_TEAM_CODE_PRIMARY="${SEED_TEAM_CODE_PRIMARY:-HR}"
SEED_TEAM_CODE_SECONDARY="${SEED_TEAM_CODE_SECONDARY:-IT}"
SEED_TEAM_CODE_ADMIN="${SEED_TEAM_CODE_ADMIN:-OPS}"
SEED_AREA_TITLE="${SEED_AREA_TITLE:-Global Management}"
SEED_PROCESS_TITLE="${SEED_PROCESS_TITLE:-Employee Workplace Relocation}"
SEED_ITIL_PRACTICE_CODE="${SEED_ITIL_PRACTICE_CODE:-APO07}"
BPMN_UPLOAD_PATH="${BPMN_UPLOAD_PATH:-$REPO_ROOT/verification/fixtures/validation-process.bpmn}"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/curl_test_lib.sh"

UNIQUE_TAG="${RUN_ID//-/}"
SHORT_CODE="${RANDOM}${RANDOM}"
TEMP_TEAM_CODE="T${SHORT_CODE:0:6}"
TEMP_PRACTICE_CODE="E${SHORT_CODE:0:6}"
TEMP_REVIEWER_EMAIL="validation.reviewer.${UNIQUE_TAG}@example.com"
TEMP_USER_EMAIL="validation.user.${UNIQUE_TAG}@example.com"

procedure_payload() {
  local title="$1"
  local utility="$2"
  local warranty="$3"
  local outcome="$4"
  local policy="$5"

  cat <<JSON
{
  "title": "$title",
  "utility": "$utility",
  "warranty": "$warranty",
  "outcome": "$outcome",
  "policy": "$policy",
  "activities": [
    {
      "resource": "Human Resources Department",
      "serviceAction": "Validate validation workflow package",
      "workInstruction": "Review the BPMN, confirm metadata completeness, and prepare the workflow for the next governance step."
    }
  ],
  "inputs": ["Approved validation test scope"],
  "outputs": ["Validated workflow validation package"]
}
JSON
}

create_version_payload() {
  local architecture_state="$1"
  local title="$2"
  local change_description="$3"
  local reason_for_change="$4"
  local derived_from_version_id="${5:-}"

  if [[ -n "$derived_from_version_id" ]]; then
    cat <<JSON
{
  "architectureState": "$architecture_state",
  "title": "$title",
  "changeDescription": "$change_description",
  "reasonForChange": "$reason_for_change",
  "derivedFromVersionId": "$derived_from_version_id"
}
JSON
  else
    cat <<JSON
{
  "architectureState": "$architecture_state",
  "title": "$title",
  "changeDescription": "$change_description",
  "reasonForChange": "$reason_for_change"
}
JSON
  fi
}

create_version_bundle() {
  local prefix="$1"
  local process_id="$2"
  local architecture_state="$3"
  local title="$4"
  local change_description="$5"
  local reason_for_change="$6"
  local derived_from_version_id="${7:-}"

  local create_payload
  create_payload="$(
    create_version_payload \
      "$architecture_state" \
      "$title" \
      "$change_description" \
      "$reason_for_change" \
      "$derived_from_version_id"
  )"

  post_json \
    "Create version $prefix" \
    201 \
    "$API_BASE_URL/processes/$process_id/versions" \
    "$EDITOR_TOKEN" \
    "$create_payload"
  assign_json_value "${prefix}_VERSION_ID" "$LAST_BODY_FILE" "data.id" "Failed to resolve version id for $prefix."

  local version_var="${prefix}_VERSION_ID"
  local version_id
  version_id="${!version_var}"

  post_form_file \
    "Upload BPMN asset for $prefix" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/assets/bpmn" \
    "$EDITOR_TOKEN" \
    "$BPMN_UPLOAD_PATH" \
    "$title BPMN"
  assign_json_value "${prefix}_ASSET_ID" "$LAST_BODY_FILE" "data.id" "Failed to resolve asset id for $prefix."

  local procedure_json
  procedure_json="$(
    procedure_payload \
      "$title Procedure" \
      "Utility statement for $title." \
      "Warranty statement for $title." \
      "Outcome statement for $title." \
      "Policy statement for $title."
  )"

  post_json \
    "Create procedure for $prefix" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/procedures" \
    "$EDITOR_TOKEN" \
    "$procedure_json"
  assign_json_value "${prefix}_PROCEDURE_ID" "$LAST_BODY_FILE" "data.id" "Failed to resolve procedure id for $prefix."
}

submit_version() {
  local label="$1"
  local version_id="$2"
  local actor_token="$3"
  local reason="$4"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/submit-for-review" \
    "$actor_token" \
    "{\"reason\":\"$reason\"}"
}

approve_version() {
  local label="$1"
  local version_id="$2"
  local reason="$3"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/approve" \
    "$REVIEWER_TOKEN" \
    "{\"reason\":\"$reason\"}"
}

reject_version() {
  local label="$1"
  local version_id="$2"
  local reason="$3"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/reject" \
    "$REVIEWER_TOKEN" \
    "{\"reason\":\"$reason\"}"
}

reopen_version() {
  local label="$1"
  local version_id="$2"
  local reason="$3"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/reopen" \
    "$REVIEWER_TOKEN" \
    "{\"reason\":\"$reason\"}"
}

publish_version() {
  local label="$1"
  local version_id="$2"
  local reason="$3"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/publish" \
    "$PUBLISHER_TOKEN" \
    "{\"reason\":\"$reason\"}"
}

archive_version() {
  local label="$1"
  local version_id="$2"
  local reason="$3"

  post_json \
    "$label" \
    201 \
    "$API_BASE_URL/process-versions/$version_id/archive" \
    "$PUBLISHER_TOKEN" \
    "{\"reason\":\"$reason\"}"
}

section "Environment checks"
require_command curl
require_command node

if [[ ! -f "$BPMN_UPLOAD_PATH" ]]; then
  fail_with "Seed/data assumption issue" "BPMN upload file was not found at $BPMN_UPLOAD_PATH."
fi

get_request "Health check" 200 "$API_BASE_URL/health"
assert_file_contains "$LAST_BODY_FILE" "\"status\":\"UP\"" "Health endpoint did not report UP status."

section "Authentication and discovery"
login_and_load_profile "EDITOR" "$EDITOR_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"
login_and_load_profile "REVIEWER" "$REVIEWER_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"
login_and_load_profile "PUBLISHER" "$PUBLISHER_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"
login_and_load_profile "ADMIN" "$ADMIN_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"
login_and_load_profile "VIEWER" "$VIEWER_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"

get_request "List users" 200 "$API_BASE_URL/users" "$ADMIN_TOKEN"
USERS_FILE="$LAST_BODY_FILE"
assign_json_value HR_EDITOR_ID "$USERS_FILE" "data.find((item) => item.email === '$EDITOR_EMAIL').id" "Unable to resolve the seeded editor id."
assign_json_value SEEDED_VIEWER_ID "$USERS_FILE" "data.find((item) => item.email === '$VIEWER_EMAIL').id" "Unable to resolve the seeded viewer id."

get_request "List teams" 200 "$API_BASE_URL/teams" "$ADMIN_TOKEN"
TEAMS_FILE="$LAST_BODY_FILE"
assign_json_value HR_TEAM_ID "$TEAMS_FILE" "data.find((item) => item.code === '$SEED_TEAM_CODE_PRIMARY').id" "Unable to resolve the seeded HR team."
assign_json_value IT_TEAM_ID "$TEAMS_FILE" "data.find((item) => item.code === '$SEED_TEAM_CODE_SECONDARY').id" "Unable to resolve the seeded IT team."
assign_json_value OPS_TEAM_ID "$TEAMS_FILE" "data.find((item) => item.code === '$SEED_TEAM_CODE_ADMIN').id" "Unable to resolve the seeded OPS team."

get_request "List owner options" 200 "$API_BASE_URL/users/owner-options" "$EDITOR_TOKEN"
get_request "List all owner options" 200 "$API_BASE_URL/users/owner-options/all" "$EDITOR_TOKEN"
get_request "List owner options by team" 200 "$API_BASE_URL/users/owner-options/team/$HR_TEAM_ID" "$EDITOR_TOKEN"
get_request "List team options" 200 "$API_BASE_URL/users/team-options" "$EDITOR_TOKEN"

get_request "List areas" 200 "$API_BASE_URL/areas" "$EDITOR_TOKEN"
assign_json_value SEEDED_AREA_ID "$LAST_BODY_FILE" "data.find((item) => item.title === '$SEED_AREA_TITLE').id" "Unable to resolve the seeded area."

get_request "List processes" 200 "$API_BASE_URL/processes" "$EDITOR_TOKEN"
assign_json_value SEEDED_PROCESS_ID "$LAST_BODY_FILE" "data.find((item) => item.title === '$SEED_PROCESS_TITLE').id" "Unable to resolve the seeded process."

get_request "List ITIL practices" 200 "$API_BASE_URL/itil-practices" "$EDITOR_TOKEN"
assign_json_value SEEDED_ITIL_PRACTICE_ID "$LAST_BODY_FILE" "data.find((item) => item.code === '$SEED_ITIL_PRACTICE_CODE').id" "Unable to resolve the seeded ITIL practice."

get_request "List glossary terms" 200 "$API_BASE_URL/glossary" "$EDITOR_TOKEN"
get_request "Get public glossary" 200 "$PUBLIC_BASE_URL/glossary"

section "Public discovery"
get_request "List public areas" 200 "$PUBLIC_BASE_URL/areas"
get_request "List public processes" 200 "$PUBLIC_BASE_URL/processes"
get_request "Get public process detail" 200 "$PUBLIC_BASE_URL/processes/$SEEDED_PROCESS_ID"
PUBLIC_PROCESS_DETAIL_FILE="$LAST_BODY_FILE"
assign_json_value SEEDED_PUBLIC_ASIS_VERSION_ID "$PUBLIC_PROCESS_DETAIL_FILE" "data.versions.asIs.id" "Unable to resolve the public AS-IS version id."
assign_json_value SEEDED_PUBLIC_PROCEDURE_ID "$PUBLIC_PROCESS_DETAIL_FILE" "data.versions.asIs.procedures[0].id" "Unable to resolve the public procedure id."

section "Technical administration coverage"
post_json \
  "Create temporary team" \
  201 \
  "$API_BASE_URL/teams" \
  "$ADMIN_TOKEN" \
  "{\"code\":\"$TEMP_TEAM_CODE\",\"name\":\"Validation Team $UNIQUE_TAG\",\"description\":\"Temporary team used by the curl verification suite.\"}"
assign_json_value TEMP_TEAM_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary team id."

get_request "Get temporary team" 200 "$API_BASE_URL/teams/$TEMP_TEAM_ID" "$ADMIN_TOKEN"

patch_json \
  "Update temporary team" \
  200 \
  "$API_BASE_URL/teams/$TEMP_TEAM_ID" \
  "$ADMIN_TOKEN" \
  "{\"name\":\"Validation Team $UNIQUE_TAG Updated\",\"description\":\"Updated temporary team used by the curl verification suite.\"}"

post_json \
  "Create temporary technical user" \
  201 \
  "$API_BASE_URL/users" \
  "$ADMIN_TOKEN" \
  "{\"name\":\"Validation User $UNIQUE_TAG\",\"email\":\"$TEMP_USER_EMAIL\",\"roleName\":\"VIEWER\",\"teamId\":\"$TEMP_TEAM_ID\",\"password\":\"$DEMO_USER_PASSWORD\"}"
assign_json_value TEMP_USER_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary user id."

get_request "Get temporary technical user" 200 "$API_BASE_URL/users/$TEMP_USER_ID" "$ADMIN_TOKEN"

patch_json \
  "Update temporary technical user" \
  200 \
  "$API_BASE_URL/users/$TEMP_USER_ID" \
  "$ADMIN_TOKEN" \
  "{\"name\":\"Validation User $UNIQUE_TAG Updated\",\"roleName\":\"REVIEWER\",\"teamId\":\"$IT_TEAM_ID\"}"

patch_json \
  "Reset temporary user password" \
  200 \
  "$API_BASE_URL/users/$TEMP_USER_ID/reset-password" \
  "$ADMIN_TOKEN" \
  "{\"newPassword\":\"$DEMO_USER_PASSWORD\"}"

post_json \
  "Create cross-team reviewer" \
  201 \
  "$API_BASE_URL/users" \
  "$ADMIN_TOKEN" \
  "{\"name\":\"Validation Cross-Team Reviewer $UNIQUE_TAG\",\"email\":\"$TEMP_REVIEWER_EMAIL\",\"roleName\":\"REVIEWER\",\"teamId\":\"$IT_TEAM_ID\",\"password\":\"$DEMO_USER_PASSWORD\"}"
assign_json_value TEMP_REVIEWER_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the cross-team reviewer id."

section "Editor CRUD coverage"
post_json \
  "Create temporary ITIL practice" \
  201 \
  "$API_BASE_URL/itil-practices" \
  "$EDITOR_TOKEN" \
  "{\"code\":\"$TEMP_PRACTICE_CODE\",\"name\":\"Validation Practice $UNIQUE_TAG\",\"description\":\"Temporary ITIL practice created by the verification script.\"}"
assign_json_value TEMP_PRACTICE_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary ITIL practice id."

post_json \
  "Create temporary glossary term" \
  201 \
  "$API_BASE_URL/glossary" \
  "$EDITOR_TOKEN" \
  "{\"term\":\"Validation Term $UNIQUE_TAG\",\"definition\":\"Temporary glossary entry created by the verification script for run $UNIQUE_TAG.\",\"category\":\"Validation\",\"isPreferred\":true}"
assign_json_value TEMP_GLOSSARY_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary glossary id."

get_request "Get temporary glossary term" 200 "$API_BASE_URL/glossary/$TEMP_GLOSSARY_ID" "$EDITOR_TOKEN"

patch_json \
  "Update temporary glossary term" \
  200 \
  "$API_BASE_URL/glossary/$TEMP_GLOSSARY_ID" \
  "$EDITOR_TOKEN" \
  "{\"definition\":\"Updated temporary glossary entry created by the verification script for run $UNIQUE_TAG.\"}"

post_json \
  "Create temporary area" \
  201 \
  "$API_BASE_URL/areas" \
  "$EDITOR_TOKEN" \
  "{\"title\":\"Validation Area $UNIQUE_TAG\",\"description\":\"Temporary area created by the verification script.\",\"teamId\":\"$HR_TEAM_ID\",\"ownerId\":\"$HR_EDITOR_ID\",\"itilPracticeId\":\"$TEMP_PRACTICE_ID\"}"
assign_json_value TEMP_AREA_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary area id."

get_request "Get temporary area" 200 "$API_BASE_URL/areas/$TEMP_AREA_ID" "$EDITOR_TOKEN"

patch_json \
  "Update temporary area" \
  200 \
  "$API_BASE_URL/areas/$TEMP_AREA_ID" \
  "$EDITOR_TOKEN" \
  "{\"description\":\"Updated temporary area created by the verification script.\"}"

post_json \
  "Create disposable delete area" \
  201 \
  "$API_BASE_URL/areas" \
  "$EDITOR_TOKEN" \
  "{\"title\":\"Validation Delete Area $UNIQUE_TAG\",\"description\":\"Temporary area used to validate delete operations.\",\"teamId\":\"$HR_TEAM_ID\",\"ownerId\":\"$HR_EDITOR_ID\",\"itilPracticeId\":\"$SEEDED_ITIL_PRACTICE_ID\"}"
assign_json_value DELETE_AREA_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the disposable delete area id."

post_json \
  "Create temporary process" \
  201 \
  "$API_BASE_URL/processes" \
  "$EDITOR_TOKEN" \
  "{\"title\":\"Validation Process $UNIQUE_TAG\",\"description\":\"Temporary process created by the verification script.\",\"teamId\":\"$HR_TEAM_ID\",\"ownerId\":\"$HR_EDITOR_ID\",\"areaId\":\"$TEMP_AREA_ID\"}"
assign_json_value TEMP_PROCESS_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the temporary process id."

get_request "Get temporary process" 200 "$API_BASE_URL/processes/$TEMP_PROCESS_ID" "$EDITOR_TOKEN"

patch_json \
  "Update temporary process" \
  200 \
  "$API_BASE_URL/processes/$TEMP_PROCESS_ID" \
  "$EDITOR_TOKEN" \
  "{\"description\":\"Updated temporary process created by the verification script.\"}"

post_json \
  "Create disposable delete process" \
  201 \
  "$API_BASE_URL/processes" \
  "$EDITOR_TOKEN" \
  "{\"title\":\"Validation Delete Process $UNIQUE_TAG\",\"description\":\"Temporary process used to validate delete operations.\",\"teamId\":\"$HR_TEAM_ID\",\"ownerId\":\"$HR_EDITOR_ID\",\"areaId\":\"$DELETE_AREA_ID\"}"
assign_json_value DELETE_PROCESS_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the disposable delete process id."

section "Version, asset, and procedure coverage"
create_version_bundle \
  WORKFLOW_ASIS \
  "$TEMP_PROCESS_ID" \
  "AS-IS" \
  "Validation Process $UNIQUE_TAG v1.0" \
  "Baseline AS-IS version created for verification." \
  "Demonstrate the governed lifecycle from draft to publication."

WORKFLOW_ASIS_VERSION_ID="${WORKFLOW_ASIS_VERSION_ID}"
WORKFLOW_ASIS_ASSET_ID="${WORKFLOW_ASIS_ASSET_ID}"
WORKFLOW_ASIS_PROCEDURE_ID="${WORKFLOW_ASIS_PROCEDURE_ID}"

get_request "List versions for temporary process" 200 "$API_BASE_URL/processes/$TEMP_PROCESS_ID/versions" "$EDITOR_TOKEN"
get_request "Get temporary AS-IS version" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID" "$EDITOR_TOKEN"

patch_json \
  "Update temporary AS-IS version" \
  200 \
  "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "{\"title\":\"Validation Process $UNIQUE_TAG v1.0 Updated\",\"changeDescription\":\"Updated baseline AS-IS version created for verification.\",\"reasonForChange\":\"Keep the verification workflow metadata current.\"}"

get_request "List assets for temporary AS-IS version" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID/assets" "$EDITOR_TOKEN"
get_request "Get current asset for temporary AS-IS version" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID/assets/current" "$EDITOR_TOKEN"
get_request "Get BPMN asset content for temporary AS-IS version" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID/assets/$WORKFLOW_ASIS_ASSET_ID/content" "$EDITOR_TOKEN"

get_request "List all procedures" 200 "$API_BASE_URL/procedures" "$EDITOR_TOKEN"
get_request "List procedures for temporary AS-IS version" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID/procedures" "$EDITOR_TOKEN"
get_request "Get temporary procedure" 200 "$API_BASE_URL/procedures/$WORKFLOW_ASIS_PROCEDURE_ID" "$EDITOR_TOKEN"

patch_json \
  "Update temporary procedure" \
  200 \
  "$API_BASE_URL/procedures/$WORKFLOW_ASIS_PROCEDURE_ID" \
  "$EDITOR_TOKEN" \
  "$(procedure_payload \
      "Validation Process $UNIQUE_TAG v1.0 Procedure Updated" \
      "Updated utility statement for the validation workflow." \
      "Updated warranty statement for the validation workflow." \
      "Updated outcome statement for the validation workflow." \
      "Updated policy statement for the validation workflow.")"

section "Lifecycle workflow coverage"
submit_version \
  "Submit temporary AS-IS version for review" \
  "$WORKFLOW_ASIS_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted from the validation script to validate the review gate."

get_request "List version state history" 200 "$API_BASE_URL/process-versions/$WORKFLOW_ASIS_VERSION_ID/state-history" "$REVIEWER_TOKEN"
get_request "List workflow audit logs for temporary version" 200 "$API_BASE_URL/audit-logs/process_version/$WORKFLOW_ASIS_VERSION_ID" "$REVIEWER_TOKEN"
get_request "List workflow audit logs for temporary procedure" 200 "$API_BASE_URL/audit-logs/procedure/$WORKFLOW_ASIS_PROCEDURE_ID" "$REVIEWER_TOKEN"
get_request "List workflow audit logs for temporary asset" 200 "$API_BASE_URL/audit-logs/asset/$WORKFLOW_ASIS_ASSET_ID" "$REVIEWER_TOKEN"
get_request "List workflow audit logs for temporary area" 200 "$API_BASE_URL/audit-logs/area/$TEMP_AREA_ID" "$REVIEWER_TOKEN"
get_request "List workflow audit logs for temporary process" 200 "$API_BASE_URL/audit-logs/process/$TEMP_PROCESS_ID" "$REVIEWER_TOKEN"

approve_version \
  "Approve temporary AS-IS version" \
  "$WORKFLOW_ASIS_VERSION_ID" \
  "Approved from the validation script after BPMN and procedure validation."

publish_version \
  "Publish temporary AS-IS version" \
  "$WORKFLOW_ASIS_VERSION_ID" \
  "Published from the validation script as the current AS-IS baseline."

create_version_bundle \
  WORKFLOW_REJECT \
  "$TEMP_PROCESS_ID" \
  "TO-BE" \
  "Validation Process $UNIQUE_TAG v2.0 Reject" \
  "Target-state proposal used to validate the rejection path." \
  "Demonstrate reviewer rejection and return to Draft." \
  "$WORKFLOW_ASIS_VERSION_ID"
submit_version \
  "Submit rejection test version for review" \
  "$WORKFLOW_REJECT_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted to validate reviewer rejection."
reject_version \
  "Reject temporary TO-BE version" \
  "$WORKFLOW_REJECT_VERSION_ID" \
  "Rejected to validate the controlled return from In Review to Draft."

create_version_bundle \
  WORKFLOW_REOPEN \
  "$TEMP_PROCESS_ID" \
  "TO-BE" \
  "Validation Process $UNIQUE_TAG v3.0 Reopen" \
  "Target-state proposal used to validate the reopen path." \
  "Demonstrate reviewer reopening of an approved version." \
  "$WORKFLOW_ASIS_VERSION_ID"
submit_version \
  "Submit reopen test version for review" \
  "$WORKFLOW_REOPEN_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted to validate reviewer reopen after approval."
approve_version \
  "Approve reopen test version" \
  "$WORKFLOW_REOPEN_VERSION_ID" \
  "Approved so the reopen action can be validated."
reopen_version \
  "Reopen approved temporary TO-BE version" \
  "$WORKFLOW_REOPEN_VERSION_ID" \
  "Reopened to validate the controlled return from Approved to Draft."

create_version_bundle \
  WORKFLOW_ARCHIVE \
  "$TEMP_PROCESS_ID" \
  "TO-BE" \
  "Validation Process $UNIQUE_TAG v4.0 Archive" \
  "Target-state proposal used to validate the archive path." \
  "Demonstrate publisher archive after publication." \
  "$WORKFLOW_ASIS_VERSION_ID"
submit_version \
  "Submit archive test version for review" \
  "$WORKFLOW_ARCHIVE_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted to validate publisher archive after publication."
approve_version \
  "Approve archive test version" \
  "$WORKFLOW_ARCHIVE_VERSION_ID" \
  "Approved so the archive action can be validated."
publish_version \
  "Publish archive test version" \
  "$WORKFLOW_ARCHIVE_VERSION_ID" \
  "Published so the archive action can be validated."
archive_version \
  "Archive published temporary TO-BE version" \
  "$WORKFLOW_ARCHIVE_VERSION_ID" \
  "Archived from the validation script to validate the publisher archive action."

create_version_bundle \
  WORKFLOW_PROMOTE \
  "$TEMP_PROCESS_ID" \
  "TO-BE" \
  "Validation Process $UNIQUE_TAG v5.0 Promote" \
  "Target-state proposal used to validate the promote path." \
  "Demonstrate promotion of a published TO-BE version into a new AS-IS version." \
  "$WORKFLOW_ASIS_VERSION_ID"
submit_version \
  "Submit promote test version for review" \
  "$WORKFLOW_PROMOTE_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted to validate TO-BE promotion."
approve_version \
  "Approve promote test version" \
  "$WORKFLOW_PROMOTE_VERSION_ID" \
  "Approved so the TO-BE promotion path can be validated."
publish_version \
  "Publish promote test version" \
  "$WORKFLOW_PROMOTE_VERSION_ID" \
  "Published so the TO-BE promotion path can be validated."

post_json \
  "Promote published temporary TO-BE version" \
  201 \
  "$API_BASE_URL/process-versions/$WORKFLOW_PROMOTE_VERSION_ID/promote" \
  "$PUBLISHER_TOKEN" \
  "{\"justification\":\"Promoted from the validation script to validate the new AS-IS creation path.\",\"title\":\"Validation Process $UNIQUE_TAG v6.0 Promoted AS-IS\"}"
assign_json_value PROMOTED_ASIS_VERSION_ID "$LAST_BODY_FILE" "data.id" "Unable to resolve the promoted AS-IS version id."

section "Delete coverage"
delete_request "Delete disposable process" 200 "$API_BASE_URL/processes/$DELETE_PROCESS_ID" "$EDITOR_TOKEN"
delete_request "Delete disposable area" 200 "$API_BASE_URL/areas/$DELETE_AREA_ID" "$EDITOR_TOKEN"

section "Public published-only coverage"
get_request "List public processes with search filter" 200 "$PUBLIC_BASE_URL/processes?search=Employee"
get_request "List public procedures with search filter" 200 "$PUBLIC_BASE_URL/procedures?search=Transfer"
get_request "Search the public catalogue" 200 "$PUBLIC_BASE_URL/search?search=Relocation"
get_request "List public process history" 200 "$PUBLIC_BASE_URL/processes/$SEEDED_PROCESS_ID/versions"
get_request "Get public procedure detail" 200 "$PUBLIC_BASE_URL/procedures/$SEEDED_PUBLIC_PROCEDURE_ID"
get_request "Get published BPMN XML" 200 "$PUBLIC_BASE_URL/process-versions/$SEEDED_PUBLIC_ASIS_VERSION_ID/bpmn" "" "application/xml"
assert_file_contains "$LAST_BODY_FILE" "<?xml" "The published BPMN endpoint did not return XML content."

section "Technical audit coverage"
get_request "List technical audit logs for temporary user" 200 "$API_BASE_URL/audit-logs/user/$TEMP_USER_ID" "$ADMIN_TOKEN"
get_request "List technical audit logs for temporary team" 200 "$API_BASE_URL/audit-logs/team/$TEMP_TEAM_ID" "$ADMIN_TOKEN"

section "Negative authorization and transition checks"
create_version_bundle \
  WORKFLOW_NEGATIVE \
  "$TEMP_PROCESS_ID" \
  "AS-IS" \
  "Validation Process $UNIQUE_TAG v7.0 Negative" \
  "Draft version used to validate negative RBAC and lifecycle cases." \
  "Demonstrate denial paths for incorrect roles and invalid states." \
  "$PROMOTED_ASIS_VERSION_ID"

post_json \
  "Editor cannot approve" \
  403 \
  "$API_BASE_URL/process-versions/$WORKFLOW_NEGATIVE_VERSION_ID/approve" \
  "$EDITOR_TOKEN" \
  "{\"reason\":\"This request should be denied.\"}"

post_json \
  "Reviewer cannot publish" \
  403 \
  "$API_BASE_URL/process-versions/$WORKFLOW_NEGATIVE_VERSION_ID/publish" \
  "$REVIEWER_TOKEN" \
  "{\"reason\":\"This request should be denied.\"}"

post_json \
  "Viewer cannot create area" \
  403 \
  "$API_BASE_URL/areas" \
  "$VIEWER_TOKEN" \
  "{\"title\":\"Forbidden Area\",\"description\":\"This request should be denied.\",\"teamId\":\"$HR_TEAM_ID\",\"ownerId\":\"$HR_EDITOR_ID\",\"itilPracticeId\":\"$SEEDED_ITIL_PRACTICE_ID\"}"

post_json \
  "System admin cannot approve workflow version" \
  403 \
  "$API_BASE_URL/process-versions/$WORKFLOW_NEGATIVE_VERSION_ID/approve" \
  "$ADMIN_TOKEN" \
  "{\"reason\":\"This request should be denied.\"}"

get_request "Unauthenticated area access is denied" 401 "$API_BASE_URL/areas"

post_json \
  "Publisher cannot publish a Draft version" \
  409 \
  "$API_BASE_URL/process-versions/$WORKFLOW_NEGATIVE_VERSION_ID/publish" \
  "$PUBLISHER_TOKEN" \
  "{\"reason\":\"This request should fail because the version is still in Draft.\"}"

delete_request "Process with versions cannot be deleted" 409 "$API_BASE_URL/processes/$TEMP_PROCESS_ID" "$EDITOR_TOKEN"

login_and_load_profile "TEMP_REVIEWER" "$TEMP_REVIEWER_EMAIL" "$DEMO_USER_PASSWORD" "$API_BASE_URL"

submit_version \
  "Submit cross-team denial version for review" \
  "$WORKFLOW_NEGATIVE_VERSION_ID" \
  "$EDITOR_TOKEN" \
  "Submitted so the same-team reviewer constraint can be validated."

post_json \
  "Cross-team reviewer cannot approve HR workflow" \
  403 \
  "$API_BASE_URL/process-versions/$WORKFLOW_NEGATIVE_VERSION_ID/approve" \
  "$TEMP_REVIEWER_TOKEN" \
  "{\"reason\":\"This request should be denied because the reviewer belongs to another team.\"}"

patch_json \
  "Deactivate temporary technical user" \
  200 \
  "$API_BASE_URL/users/$TEMP_USER_ID/deactivate" \
  "$ADMIN_TOKEN" \
  "{}"

patch_json \
  "Deactivate cross-team reviewer" \
  200 \
  "$API_BASE_URL/users/$TEMP_REVIEWER_ID/deactivate" \
  "$ADMIN_TOKEN" \
  "{}"

patch_json \
  "Deactivate temporary team" \
  200 \
  "$API_BASE_URL/teams/$TEMP_TEAM_ID/deactivate" \
  "$ADMIN_TOKEN" \
  "{}"

write_runtime_env
write_summary

section "Completed"
log_line "Backoffice verification completed successfully."
log_line "Log file: $(to_repo_relative "$LOG_FILE")"
log_line "Summary file: $(to_repo_relative "$SUMMARY_FILE")"
log_line ""
log_line "Summary contents:"
while IFS= read -r summary_line; do
  log_line "$summary_line"
done < "$SUMMARY_FILE"
