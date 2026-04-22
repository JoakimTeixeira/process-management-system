# Business Logic Rules

This is the complete business logic list to enforce in backend services and validate in tests, aligned with the intended database schema and the target RBAC governance model.
The intended system uses five roles:

- **EDITOR** → content preparation
- **REVIEWER** → formal validation
- **PUBLISHER** → controlled release authority
- **VIEWER** → authenticated internal consultation only (read-only)
- **SYSTEM_ADMIN** → technical administration only
  This structure strengthens governance clarity, lifecycle control, and separation of duties in line with COBIT APO01.05.

## Critical governance principle

**Approval and publication must remain separated.**
This means:

- EDITOR prepares
- REVIEWER validates
- PUBLISHER releases
- SYSTEM_ADMIN supports technically only.
  No single actor should control the full lifecycle.

---

# Table of Contents

## A. Authentication and Access Control

User authentication, role-based access control, and user administration rules.

## B. Areas

Organizational areas and their relationship to ITIL 4 practices.

## C. Processes

Business processes and their relationship to organizational areas.

## D. Process Versions

Versioned content of processes including lifecycle states and architecture states.

## E. Lifecycle Workflow

State transitions, role permissions, and workflow governance rules.

## F. TO-BE Promotion to New AS-IS

Rules for promoting TO-BE versions to become new AS-IS versions.

## G. Procedures

Detailed procedures within process versions and their execution layer.

## H. Assets / BPMN Files

File attachments, BPMN diagrams, and asset management rules.

## I. Glossary and Taxonomy

Business glossary terms and hierarchical taxonomy structure.

## J. Audit and Traceability

Audit logging, history tracking, and governance verification.

## K. Public Portal Behavior

Public-facing catalog and process exposure rules.

## M. Stakeholder Engagement and Strategic Alignment

Stakeholder identification and strategic alignment requirements.

## N. Deletion and Retention

Data retention policies and deletion restrictions.

---

# A. Authentication and Access Control

## A1

Only authenticated users can access backoffice endpoints.

## A2

Only active users can log in.

## A3

Passwords must be verified against `users.password_hash`.

## A4

A JWT token must identify the acting user.

## A5

Public portal endpoints must not require login.

## A6

Role-based restrictions must apply to all protected workflow actions.
Role rules:

- **EDITOR** → create areas, create processes, create versions, edit Draft versions, upload BPMN, create procedures, update metadata, manage glossary terms, submit for review
- **REVIEWER** → review submitted versions, approve versions, reject versions, reopen approved versions to Draft, consult audit information required for validation
- **PUBLISHER** → publish approved versions, archive published versions, execute TO-BE promotion, consult audit information required for publication decisions
- **VIEWER** → authenticated read-only consultation only
- **SYSTEM_ADMIN** → create users, update user profile data where allowed, assign roles, change team association, deactivate users, reset passwords, and perform technical-only platform administration

## A7

A user may have at most one primary role and one canonical team in the user model.

## A8

Requests without a valid JWT, or with an expired or invalid token, must be rejected.

## A9

Only SYSTEM_ADMIN may perform user administration operations.
These operations are limited to:

- create users
- update user profile data where allowed
- assign roles
- change team association
- deactivate users
- reset passwords
  They do not include governance approval decisions.

## A10

VIEWER must never perform create, update, approve, reject, reopen, publish, archive, or promotion operations.

## A11

SYSTEM_ADMIN must never approve versions, reject versions, reopen approved versions, publish versions, archive versions, or promote TO-BE to AS-IS.

## A12

SYSTEM_ADMIN is a technical role only and must not participate in governance workflow decisions.

## A13

Only SYSTEM_ADMIN may create users.

## A14

Every created user must have:

- `name`
- `email`
- `role_id`
- `team_id`

## A14a

All users must be assigned to a canonical team. Team assignment is required for organizational consistency and provides the structural context for team-level responsibility enforcement in process and procedure governance.

## A15

User email must be unique.

## A16

A user may have at most one primary role.

## A17

A user may have at most one canonical team.

## A18

Only SYSTEM_ADMIN may assign or change a user's role.

## A19

Only SYSTEM_ADMIN may assign or change a user's team association.

## A20

User role changes must be auditable.

## A21

User team changes must be auditable.

## A22

Users must not be physically deleted.

## A23

Access revocation must be implemented through logical deactivation using `is_active = FALSE`.

## A24

Inactive users must be prevented from logging in.

## A25

User creation, user update, role assignment, team change, and user deactivation must create audit log entries.

## A25a

Only SYSTEM_ADMIN may reset a user password.

Password reset is a technical administration action only.

It must:

- replace the stored password hash using the same secure hashing strategy used for login authentication
- create an audit log entry
- not grant governance workflow authority
- not be implemented as a self-service email recovery flow

## A26

SYSTEM_ADMIN must never use user administration authority to bypass governance workflow restrictions.
Creating or modifying users does not grant authority to approve, reject, reopen, publish, archive, or promote process versions.

## A27

Rejection is implemented as a formal workflow action.
It must:

- be performed only by REVIEWER
- require mandatory justification
- be recorded in audit and lifecycle history
- return the version from `In Review` to `Draft`

## A28

SYSTEM_ADMIN technical-only administration is limited to explicitly defined platform operations such as:

- user creation
- role assignment
- team assignment
- logical deactivation
- password reset
- explicitly documented technical configuration tasks
  It must not include content mutation authority or governance workflow authority.

## A29

Audit and history consultation permissions must be explicit.
At minimum:

- EDITOR may consult audit and history records related to versions they prepared
- REVIEWER may consult audit and history records related to versions under review
- PUBLISHER may consult audit and history records related to versions under publication or archival decision
- SYSTEM_ADMIN may consult technical and user-administration audit records only
- VIEWER must not access protected audit or administration records

## A30

Any technical administration task not explicitly documented for SYSTEM_ADMIN is outside the defined scope.

## A31

EDITOR must never approve, reject, reopen approved versions, publish, archive, or promote TO-BE to AS-IS.

## A32

REVIEWER must never create, update, or delete Areas, Processes, Procedures, Assets, or Glossary Terms, except where explicitly allowed by the workflow policy for metadata-only corrections during review.

## A33

Taxonomy identifiers (code) across Areas, Processes, and Procedures must be programmatically generated by the backend and saved natively into the database. Frontend interfaces must hide these fields during record creation to prevent human data-entry errors. This structural automation supports consistent control and traceability in line with COBIT APO14.02.

## A34

Only SYSTEM_ADMIN may create or update Teams.

Teams must not be physically deleted.

If a Team should no longer be available for new assignments, it must be logically deactivated using `is_active = FALSE`.

Inactive Teams must remain preserved for historical traceability but must not appear as selectable options in new Area, Process, Procedure, or User assignment forms.

---

# B. Areas

## B1

An Area must have:

- `code`
- `title`
- `team_id`
- `owner_id`

## B2

Area code must be unique.

## B3

An Area may contain many Processes.

## B4

An Area cannot exist without a canonical team and an owner.

The selected owner must be an active user belonging to the Area `team_id`.

## B4a

An Area belongs to exactly one canonical Team through `team_id`.

Only users belonging to that same Team may be selected as the Area owner.

## B5

Each Area must correspond to exactly one ITIL 4 practice.

## B6

Each Area must be linked to exactly one approved ITIL 4 practice through `itil_practice_id`.
The Area title is independent business-facing content and does not need to equal the ITIL 4 practice name.

## B7

A Process inherits its ITIL 4 practice classification from its Area.

## B8

Only EDITOR may create, update, or delete Areas.

## B9

REVIEWER, PUBLISHER, VIEWER, and SYSTEM_ADMIN must not create, update, or delete Areas.

---

# C. Processes

## C1

A Process must belong to exactly one Area.

## C2

A Process must have:

- `area_id`
- `team_id`
- `code`
- `title`
- `description`
- `owner_id`

To preserve the stable institutional identity of the workflow without overcomplicating the schema, the generic description field is used to capture the macro-level context, avoiding version-specific execution details.

## C3

Process code must be unique.

## C4

A Process is the stable identity; versioned content belongs in `process_versions`.

## C5

A Process may have zero or many versions.

## C6

Only EDITOR may create, update, or delete Processes.

## C7

REVIEWER, PUBLISHER, VIEWER, and SYSTEM_ADMIN must not create, update, or delete Processes.

## C8

The Process code must be formatted as a primary identifier (e.g., a whole-number string like "1" or "7") to establish the top-level workflow identity within the organizational taxonomy. To prevent semantic confusion and ensure valid taxonomy structure, this code must not be provided by the user. It must be programmatically generated by the application layer (NestJS) by querying the highest existing process code and incrementing it sequentially. This code remains globally unique across the database.

## C9

Team-Level Responsibility: Any EDITOR attempting to create, update, or delete a Process, or attempting to add a new Process Version to an existing Process, must belong to the same canonical team as the Process `team_id`.

If the EDITOR's canonical team does not match the Process `team_id`, the application must block the mutation to prevent unauthorized cross-departmental edits.

## C10

The Process owner must be an active user belonging to the Process `team_id`.

The frontend must select Team first and then restrict the owner dropdown to users belonging to the selected Team.

---

# D. Process Versions

## D1

A Version must belong to exactly one Process.

## D2

The version record does not use a separate summary field. On creation, the client must provide:

- `process_id`
- `architecture_state`
- `title`
- `change_description`
- `reason_for_change`

  On creation, the system must automatically assign:

- `version_number`
- `lifecycle_state = Draft`
- `created_by`
- `updated_by`
- timestamps

  All other content fields may remain empty until later completion in Draft state.

## D3

`version_number` must be unique within the same process.

## D4

`architecture_state` must be one of:

- `AS-IS`
- `TO-BE`

## D5

`lifecycle_state` must be one of:

- `Draft`
- `In Review`
- `Approved`
- `Published`
- `Archived`

## D6

A new version must start in `Draft`.

## D7

A process can have at most:

- one published `AS-IS`
- one published `TO-BE`
  This is reinforced by the partial unique index.
  The uniqueness restriction applies only to `Published` versions, not to `Draft`, `In Review`, `Approved`, or `Archived`.

## D8

A new version may optionally reference a parent version through `derived_from_version_id`.

## D9

If `derived_from_version_id` is used, it must reference a version of the same process.

## D10

A version created from a TO-BE implementation must become a new `AS-IS` version and must not mutate the existing `TO-BE` record.

## D11

Published versions must be treated as immutable in practice.
Any change must create a new version.

## D12

Only versions in `Draft` may be edited directly.

## D13

Versions in `In Review`, `Approved`, `Published`, and `Archived` must not allow normal direct editing.
Exception:

- `In Review` may allow limited metadata-only corrections if explicitly requested by REVIEWER and explicitly allowed by backend policy.

## D14

Archived versions cannot be republished or reopened directly.

## D15

A version must not be published unless the submission checklist is complete.

## D16

A version must not be submitted for review unless minimum required metadata is present.

## D17

A version must not be submitted for review or published unless it has at least one BPMN asset attached.

## D18

Creating a new version must create an initial `version_state_history` row with `to_state = Draft`.

## D19

Mutability by lifecycle state must follow these rules:

- `Draft` → mutable
- `In Review` → limited metadata-only correction if explicitly allowed
- `Approved` → immutable for business content
- `Published` → immutable
- `Archived` → immutable

## D20

Any governance-approved state must be immutable.
At minimum, `Approved`, `Published`, and `Archived` versions must not allow direct business-content mutation.

## D21

If `In Review` mutability is allowed, it must be limited to reviewer-requested metadata corrections only.
It must not allow:

- process intent changes
- architecture-state changes
- BPMN replacement
- procedure restructuring
- lifecycle bypass

## D22

An `Approved` version must be frozen for business content.
After approval, only publication or controlled reopening may occur.
Any content correction must require either controlled reopening to `Draft` or creation of a new version rather than direct mutation of the approved record.

## D23

A `Published` version is an official institutional record and must remain fully immutable.
Direct editing, BPMN replacement, metadata mutation, and rollback transitions are forbidden.

## D24

An `Archived` version is historical record only and must remain read-only.
If a new operational version is needed, it must be created as a new version rather than by reopening the archived record.

## D25

Multiple versions in `Approved` state may exist for the same process.
Only `Published` versions are subject to uniqueness restrictions by `architecture_state`.

## D26

A `Published` version is the current official institutional version for its process and `architecture_state`.
It remains active until it is explicitly archived or automatically replaced by the publication of a newer version of the same process and `architecture_state`.

## D27

`Published` has no automatic expiration.
A published version remains valid indefinitely until a governed archival or replacement event occurs.

---

# E. Lifecycle Workflow

## E1

Allowed minimum state transitions are:

- `Draft -> In Review`
- `In Review -> Draft` through formal rejection only
- `In Review -> Approved`
- `Approved -> Draft` through controlled reopening only
- `Approved -> Published`
- `Published -> Archived`

## E2

Rollback transitions are omitted except for:

- formal rejection `In Review -> Draft`
- controlled reopening `Approved -> Draft`

## E3

Invalid transitions must be rejected.

## E4

Every valid lifecycle transition must create:

- one `version_state_history` row
- one `audit_logs` row

## E5

`updated_by` must reflect the actor performing the latest change.

## E6

Only EDITOR can create versions.

## E7

Only EDITOR can submit `Draft -> In Review`.

## E8

Only REVIEWER can approve `In Review -> Approved`.

## E9

Only REVIEWER can reject `In Review -> Draft`.

## E10

Only REVIEWER can reopen `Approved -> Draft`.

## E11

Only PUBLISHER can publish `Approved -> Published`.

## E12

Only PUBLISHER can archive `Published -> Archived`.

## E13

Publishing a version must automatically archive any currently published version of the same process and `architecture_state`, if one exists.
This automatic archival must occur inside the same transaction as Publish.

## E14

Approval and publication must remain separated.
The same actor must not approve and publish the same version.

## E15

A REVIEWER must never publish versions.

## E16

A PUBLISHER must never approve, reject, or reopen versions.

## E17

Each lifecycle transition must execute inside one atomic transaction.

## E18

If any step of a lifecycle transition fails, the entire transaction must roll back.

## E19

Critical workflow actions should lock the relevant version rows during the transaction to prevent concurrent inconsistencies.

## E20

Important transitions such as reject, reopen, publish, archive, and promote must record a justification in history and/or audit fields.

## E21

`Draft -> Published` must be rejected.

## E22

`Published -> Draft` must be rejected.

## E23

`Approved -> Archived` must be rejected.
Only versions that were previously `Published` may transition to `Archived`.

## E24

Direct editing of a `Published` version must be rejected.

## E25

If a content correction is needed after a version reaches `Published`, the system must require creation of a new version rather than direct mutation of the frozen record.

## E26

`Draft -> In Review` requires:

- actor is EDITOR
- version is currently in `Draft`
- minimum required metadata is present
- at least one valid BPMN asset is attached
- lifecycle transition is valid

## E27

`In Review -> Approved` requires:

- actor is REVIEWER
- version is currently in `In Review`
- reviewer validation is completed
- no blocking issues remain
- lifecycle transition is valid

## E28

`In Review -> Draft` through rejection requires:

- actor is REVIEWER
- version is currently in `In Review`
- rejection justification is provided
- lifecycle transition is valid
- one `version_state_history` row is inserted
- one `audit_logs` row is inserted

## E29

`Approved -> Draft` is allowed only as a controlled reopening action.
It requires:

- actor is REVIEWER
- version is currently in `Approved`
- explicit reopening justification is provided
- one `version_state_history` row is inserted
- one `audit_logs` row is inserted
- lifecycle transition is valid
  This action represents formal rework before publication and must not be treated as an informal rollback.

## E30

`Approved -> Published` requires:

- actor is PUBLISHER
- version is currently in `Approved`
- approval and publication are separated
- required metadata is complete
- at least one valid BPMN asset exists
- published uniqueness rules are satisfied
- lifecycle transition is valid

## E31

`Published -> Archived` requires:

- actor is PUBLISHER
- version is currently in `Published`
- archive justification is provided
- lifecycle transition is valid

## E32

Formal rejection is the only allowed transition that returns a version from `In Review` to `Draft`.
No other undocumented rollback path may exist.

## E33

Archival is the end-of-life mechanism for a published version.
A published version may cease to be active only by:

- explicit archival by PUBLISHER
- automatic archival triggered by publication of a newer version of the same process and `architecture_state`

## E34

If a version is mistakenly published, the system must not allow direct editing or rollback of the published record.
Correction must occur through:

- archival of the mistakenly published version
- publication of another approved version, or
- creation of a new corrective version that re-enters the normal lifecycle workflow

## E35

When multiple `Approved` versions exist for the same process and architecture state, the PUBLISHER may choose which approved version proceeds to publication.
Publishing one approved version does not automatically invalidate other approved versions.
Those versions remain `Approved` until published or formally reopened to `Draft`.

---

# F. TO-BE Promotion to New AS-IS

## F1

Only PUBLISHER may execute TO-BE promotion.

## F2

Only a published `TO-BE` version can be promoted.

## F3

Promotion must create a new `AS-IS` version.

## F4

The new `AS-IS` version must reference the TO-BE source version through `derived_from_version_id`.

## F5

If there is a currently published `AS-IS` version, it must be archived during promotion.

## F6

The promoted `TO-BE` version must be archived after promotion.

## F7

The new `AS-IS` version must become the only published `AS-IS` version for that process.

## F8

Promotion must generate:

- audit log entry
- state history rows where applicable

## F9

Promotion must execute inside one atomic transaction.

## F10

If any step of promotion fails, the entire operation must roll back.

## F11

TO-BE promotion must not mutate an existing `AS-IS` version in place.

## F12

TO-BE promotion is a version-creation event, not an edit event.
It must preserve:

- the original promoted TO-BE
- the previous AS-IS
  as historical record.

---

# G. Procedures

## G1

A Procedure must belong to exactly one Process Version.

## G2

Procedure code must be unique within the same process version.

## G3

A Procedure must have:

- `process_version_id`
- `code`
- `title`

To align procedure content with the intended schema and ITIL framing, the system must not use generic `summary`, `purpose`, or `scope` fields, and it should not use a combined `itil_dimensions` object. Procedure content must instead be captured through explicit `utility`, `warranty`, `outcome`, `policy`, `activities`, `inputs`, and `outputs` fields.

## G4

Procedures are version-specific, not process-global.

## G5

Only EDITOR may create or update Procedures.

## G6

Procedures may only be created or updated for versions currently in `Draft`.

Procedures attached to versions in:

- `In Review`
- `Approved`
- `Published`
- `Archived`

must not be modified directly.

## G7

If `In Review` corrective changes are allowed by workflow policy, those corrections must remain limited to metadata only and must not bypass immutability after approval.

## G8

The Procedure code must be formatted as a sub-level hierarchical identifier (e.g., a floating-point string like "1.1" or "7.5") to maintain visual continuity with its parent process. To mathematically enforce the Area > Process > Procedure taxonomy, this code must be programmatically calculated by the backend. The application layer must automatically inherit the parent Process's primary identifier and append the next sequential sub-level identifier. This code is not globally unique; it is strictly unique within the context of a specific process_version_id

## G9

Team-Level Responsibility: Any EDITOR attempting to create or update a Procedure must belong to the same canonical team as the parent Process `team_id`.

Procedures cannot be authored or modified by an EDITOR from an external team, ensuring holistic team ownership over the entire workflow version.

## G10

G10 Execution Layer ITIL 4 Alignment (Hybrid Data Model): To mathematically prevent semantic confusion and strengthen control consistency in line with COBIT APO14.02, the execution layer uses a JSONB schema to prevent relational database bloat. The activities JSONB array must strictly enforce the official ITIL 4 Glossary terminology. Every execution step must define a resource, a service_action, and a work_instruction. Generic attributes (such as 'task', 'actor', or 'description') are strictly forbidden within the execution arrays.

---

# H. Assets / BPMN Files

## H1

An Asset must belong to exactly one Process Version.

## H2

Only allowed asset types are:

- `BPMN`
- `DMN`
- `PNG`
- `SVG`
- `PDF`

## H3

BPMN upload must be restricted to valid BPMN/XML files in backend validation.

## H4

Assets are version-specific.
They do not automatically clone across versions.

## H5

Uploading an asset must create an audit log entry.

## H6

A public BPMN viewer must only load assets belonging to published versions.

## H7

Published version assets must be treated as immutable in practice.
Replacing them requires creating a new process version.

## H8

Only EDITOR may upload or supersede assets.

## H9

Assets may only be uploaded or superseded for versions currently in `Draft`.

Asset supersession means that the old asset remains stored for traceability, while the new asset is inserted as a separate row and marked as the current asset.

The application may implement supersession through fields such as:

- `replaced_by_asset_id`
- `superseded_at`
- `is_current`

The normal backoffice diagram view should display only the current asset.

Audit and history views may display both current and superseded assets for traceability.

## H10

If `In Review` corrective changes are allowed, BPMN asset replacement or supersession during `In Review` must not be allowed.

Only metadata-only corrections are acceptable.

## H11

Assets may include a required `caption` field for human-readable display purposes.

The caption is used only to describe the visual or document artifact in the user interface, such as a BPMN diagram label, figure title, or supporting document description.

The caption must not be treated as a taxonomy identifier, governance code, ownership field, or searchable business hierarchy element.

Asset captions must not replace the official business meaning stored in Areas, Processes, Process Versions, Procedures, or Glossary Terms.

## H12

Asset types are enforced at the database level through the asset_type enum. Any attempt to insert an asset with a type not in the allowed list will be rejected by PostgreSQL constraint violation.

## H13

Beyond the type enum, the backend must validate that uploaded files match their declared type (e.g., BPMN files must contain valid BPMN/XML structure)

## H14

Assets attached to `Approved`, `Published`, or `Archived` versions must never be deleted, replaced, or superseded.

If an asset correction is needed after approval, the system must require controlled reopening to `Draft`.

If an asset correction is needed after publication or archival, the system must require creation of a new Process Version.

---

# I. Glossary and Taxonomy

## I1

Glossary terms must have:

- unique `term`
- `definition`

## I2

Hierarchy must remain:

- `Area -> Process -> Procedure`

## I3

Public portal should expose standardized business terms.

## I4

Glossary search should work over:

- `term`
- `definition`
- `category`

## I5

Only EDITOR may create, update, or delete glossary terms.

## I6

REVIEWER, PUBLISHER, VIEWER, and SYSTEM_ADMIN must not create, update, or delete glossary terms.

# J. Audit and Traceability

## J1

All create, update, state-change, upload, promotion, user creation, user update, role assignment, team change, user deactivation actions, and password reset actions must be auditable.

## J2

`audit_logs.actor_id` must store who performed the action.

## J3

`version_state_history.actor_id` must store who performed the state transition.

## J4

`created_by` and `updated_by` must be auto-filled from authenticated user context where applicable.

## J5

Public reads do not create audit entries.

## J6

`version_state_history` must be treated as append-only by the application.

## J7

`audit_logs` must be treated as append-only by the application.

## J8

The current lifecycle state in `process_versions` and the transition history in `version_state_history` must remain synchronized within the same transaction.

## J9

Approval, rejection, reopening, publication, archival, and promotion actions must remain reconstructable from audit history for governance verification.

## J10

User administration actions must remain reconstructable from audit history for accountability verification.

## J11

The audit model must distinguish governance actions from technical administration actions.

## J12

Any rejected attempt to violate critical governance rules, such as:

- unauthorized publish attempts
- invalid lifecycle transitions
- forbidden reopen attempts
- forbidden rollback attempts
  should be capturable in operational review records even if not persisted as standard audit rows.

---

# K. Public Portal Behavior

## K1

The public process catalog must show only meaningful repository content.
At minimum, only processes with at least one published version should appear.

## K2

Only `Published` versions may be exposed by:

- public comparison views
- public version-detail endpoints
- public BPMN viewer endpoints

## K3

The public process detail page should show:

- current published `AS-IS` version
- current published `TO-BE` version
- a Versions tab listing only the historical versions intentionally exposed by the portal policy

## K4

The following versions must not be shown in public comparison views:

- `Draft`
- `In Review`
- `Approved`

## K5

If no published `TO-BE` exists, the TO-BE tab should show an empty state.

## K6

If no published `AS-IS` exists, the AS-IS tab should show an empty state.

## K7

The public portal must use business-friendly terminology that shields non-technical users from ITIL 4 jargon where appropriate.

Technical terms such as "AS-IS" and "TO-BE" may be used in the backoffice for governance clarity, but the public portal should use more accessible labels such as "Current State" and "Target State" to improve usability for non-technical stakeholders.

---

# M. Stakeholder Engagement and Strategic Alignment

## M1

The intended system architecture must support continuous stakeholder feedback through documented change requests and review processes.

## M2

Process owners and business stakeholders must be identifiable through the `owner_id` field in Areas and Processes tables, while organizational responsibility must be explicitly identifiable through `team_id`.

## M3

The system should support the capture and tracking of stakeholder requirements through the change_description and reason_for_change fields in process versions.

## M4

The AS-IS and TO-BE architecture states must support the organization's future digitization ambition by providing clear comparison views between current and target operational states.

## M5

The public portal must maintain awareness of business processes by exposing published processes to all authenticated users without requiring specialized technical knowledge.

---

# N. Deletion and Retention

## N1

Audit logs and version state history must be append-only and must never be physically deleted through application workflows.

## N2

Users must not be physically deleted.

Access revocation must be performed through logical deactivation using `is_active = FALSE`.

## N3

Process Versions must not be physically deleted.

If a published version is no longer current, it must transition to `Archived`.

## N4

Published and Archived Process Versions are institutional records and must remain fully immutable.

## N5

Processes may be physically deleted only if no Process Version exists for that Process.

If at least one Process Version exists, the Process must be preserved for historical traceability.

## N6

Areas may be physically deleted only if no Process exists under that Area.

If dependent Processes exist, deletion must be rejected.

## N7

Procedures cannot be physically deleted.

To maintain taxonomy consistency and prevent numbering gaps (e.g., deleting 1.1 and leaving only 1.2), all created Procedures must be preserved regardless of lifecycle state.

Application-generated codes must remain stable and continuous within their Process Version. Allowing deletion would create structural gaps that compromise code integrity and traceability.

If a Procedure is no longer needed, it must remain in the repository as a historical record rather than being removed.

To effectively "remove" a Procedure from active use, a new Process Version must be created with the desired changes, and the previous version must be archived through the standard lifecycle workflow.

## N8

Assets must not be physically deleted through normal application workflows.

For versions currently in `Draft`, an uploaded asset may be superseded by inserting a new asset row and marking the previous asset as superseded.

Superseded assets must remain stored for traceability and audit support.

For versions in `In Review`, `Approved`, `Published`, or `Archived`, assets must not be deleted, replaced, or superseded.

The default user interface may hide superseded assets from the normal diagram view, but audit and history views must be able to expose them for traceability.

## N9

Glossary Terms must not be physically deleted.

If a term needs to be retired after governance use, it must be preserved or marked for future deprecation rather than removed.

## N10

Roles and Teams must not be deleted if they are referenced by users, ownership fields, workflow history, lifecycle records, or audit logs.

Deletion of governance reference entities must never compromise responsibility traceability.

## N11

Every allowed deletion must create an audit log entry containing:

- actor
- entity type
- entity id
- timestamp
- reason for change

Deletion without audit registration is forbidden.

## N12

Deletion must never be used to bypass lifecycle governance.

If a record has entered review, approval, publication, archival, or audit history, it must be preserved.

Deletion is only allowed for pre-governance corrections and incomplete draft-stage records.

## N13

Physical deletion must be treated as an exception, not as the default lifecycle mechanism.

The default lifecycle mechanisms are:

- user deactivation for access removal
- version archival for official repository records
- append-only audit and lifecycle history for traceability
- restricted physical deletion only for records that have not yet acquired governance relevance
