# User Roles: Responsibility Model

This responsibility model enforces COBIT APO01.05.

## Scope Clarification

The five roles in this note describe the authenticated backoffice responsibility model.

They do not describe the public portal.

Published catalogue content and the public glossary should be exposed through `/public/...` endpoints for unauthenticated access.

---

## 1. SYSTEM_ADMIN (Technical Administration Only)

Technical administration role.

### Can

- create, update, deactivate, and reset passwords for users
- create, update, and deactivate teams
- assign roles and team associations
- consult technical and user-administration audit records
- access the dedicated admin pages in the backoffice

### Cannot

- create or edit areas, processes, versions, procedures, assets, or glossary terms
- approve versions
- reject versions
- reopen versions
- publish versions
- archive versions
- promote TO-BE to AS-IS
- consult workflow audit/history for governed content
- decide governance outcomes

### Rationale

This is a technical support role, not a governance authority role.

Separating technical administration from workflow decision-making preserves segregation of duties.

### Very Important

**technical administration != governance authority**

---

## 2. EDITOR

Content preparation and repository maintenance role.

### Can

- create, update, and delete Areas
- create, update, and delete Processes
- create process versions
- edit Draft versions only
- upload BPMN and other allowed assets to Draft versions
- create and update Procedures in Draft versions
- create and manage glossary terms in the backoffice
- submit Draft versions for review
- consult workflow audit/history for governed content in the same team

### Cannot

- approve versions
- reject versions
- reopen approved versions
- publish versions
- archive versions
- promote TO-BE to AS-IS
- manage users
- manage teams

### Implementation Note

In this repository, governed mutations should be team-scoped.

An `EDITOR` may only manage processes, versions, procedures, and workflow content for the same canonical team.

### Rationale

The `EDITOR` prepares and maintains content but does not make approval or release decisions.

This preserves clear operational responsibility without governance decision authority.

---

## 3. REVIEWER

Formal validation role.

### Can

- review versions that are in `In Review`
- approve versions
- reject versions with mandatory justification
- reopen `Approved` versions back to `Draft` with justification
- consult workflow audit/history for governed content in the same team

### Cannot

- create or edit repository content
- publish versions
- archive versions
- promote TO-BE to AS-IS
- manage users
- manage teams
- consult SYSTEM_ADMIN-only audit records

### Implementation Note

Workflow authority should be team-scoped here as well.

A `REVIEWER` can only approve, reject, reopen, and inspect workflow records for content owned by the same team.

### Rationale

Approval remains separate from publication.

**Reviewer != Publisher**

This is one of the strongest governance controls in this governance model.

### Very Important

Approval and publication must remain separated.

---

## 4. PUBLISHER

Controlled release authority.

### Can

- publish `Approved` versions
- archive `Published` versions
- promote a `Published` `TO-BE` version into a new `AS-IS` version
- consult workflow audit/history for governed content in the same team

### Cannot

- create or edit repository content
- approve versions
- reject versions
- reopen versions
- manage users
- manage teams
- consult SYSTEM_ADMIN-only audit records

### Implementation Note

`PUBLISHER` authority should also be team-scoped.

Publication should additionally be constrained by the rule that the same actor must not both approve and publish the same version.

### Rationale

Publication must remain separated from review.

**Reviewer approves.**
**Publisher releases.**

This prevents concentration of critical authority in a single actor and reinforces separation of duties, in line with COBIT APO01.05.

---

## 5. VIEWER

Authenticated read-only consultation role.

### Can

- consult backoffice repository content exposed to content roles
- view processes, process versions, procedures, and governed content without mutation rights
- consult published information through the public portal like any other user

### Cannot

- mutate anything
- create versions
- approve, reject, reopen, publish, archive, or promote
- access user or team administration
- access protected workflow audit/history records
- use the backoffice glossary management pages

### Important Clarification

The intended public glossary should be exposed through the unauthenticated public portal, while backoffice glossary management endpoints should remain `EDITOR`-only.

### Rationale

This role supports transparency and consultation without governance authority.

---

# Critical Governance Principle

Approval and publication must remain separated.

This means:

- `EDITOR` prepares and maintains content
- `REVIEWER` validates and can reopen for controlled rework
- `PUBLISHER` releases and promotes published TO-BE outcomes
- `SYSTEM_ADMIN` supports technical administration only

No single actor should control the full governed lifecycle.

This aligns with clear role separation and responsibility boundaries.
