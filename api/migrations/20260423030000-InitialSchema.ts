import { MigrationInterface, QueryRunner } from 'typeorm';

const INITIAL_SCHEMA_SQL = `
-- ============================================================================
-- NOTE:
-- This migration is a raw SQL snapshot of docs/NOTE_23_DATABASE_SCHEMA.sql.
-- The only intentional change is adding PostgreSQL dollar-quoting ($$ ... $$)
-- to the PL/pgSQL function bodies so the script can execute successfully.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
--
-- Required for:
-- 1) gen_random_uuid() via pgcrypto
-- 2) fuzzy similarity matching via pg_trgm
-- 3) accent-insensitive normalization via unaccent
--
-- Why these matter:
-- - pgcrypto supports UUID primary keys without relying on the application.
-- - pg_trgm allows PostgreSQL to behave more like Fuse.js for fuzzy search.
-- - unaccent helps reproduce the prototype's accent-insensitive matching.
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================================
-- 0. COMMON TRIGGER / HELPER FUNCTIONS
--
-- set_updated_at():
-- Automatically refreshes updated_at on UPDATE operations.
--
-- normalize_search_text():
-- Converts text into a lowercase, accent-insensitive searchable form.
--
-- set_search_document():
-- Builds normalized text blobs for trigram fuzzy search.
--
-- validate_same_process_lineage():
-- Enforces that derived_from_version_id, when present, points to a version
-- belonging to the same process.
--
-- Initial scope note:
-- Search support is kept because it is useful for the public catalog and
-- taxonomy browsing, but the schema avoids overengineering the data model
-- around search-only concerns.
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_search_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
RETURN lower(unaccent(coalesce(input_text, '')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION set_search_document()
RETURNS TRIGGER AS $$
BEGIN

IF TG_TABLE_NAME = 'teams' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.code, '') || ' ' ||
coalesce(NEW.name, '') || ' ' ||
coalesce(NEW.description, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'glossary_terms' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.term, '') || ' ' ||
coalesce(NEW.definition, '') || ' ' ||
coalesce(NEW.category, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'itil_practices' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.code, '') || ' ' ||
coalesce(NEW.name, '') || ' ' ||
coalesce(NEW.description, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'areas' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.code, '') || ' ' ||
coalesce(NEW.title, '') || ' ' ||
coalesce(NEW.description, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'processes' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.code, '') || ' ' ||
coalesce(NEW.title, '') || ' ' ||
coalesce(NEW.description, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'process_versions' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.version_number::TEXT, '') || ' ' ||
coalesce(NEW.title, '') || ' ' ||
coalesce(NEW.change_description, '') || ' ' ||
coalesce(NEW.reason_for_change, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'procedures' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.code, '') || ' ' ||
coalesce(NEW.title, '') || ' ' ||
coalesce(NEW.utility, '') || ' ' ||
coalesce(NEW.warranty, '') || ' ' ||
coalesce(NEW.outcome, '') || ' ' ||
coalesce(NEW.policy, '') || ' ' ||
coalesce(NEW.activities::TEXT, '') || ' ' ||
coalesce(NEW.inputs::TEXT, '') || ' ' ||
coalesce(NEW.outputs::TEXT, '')
);
RETURN NEW;
END IF;

IF TG_TABLE_NAME = 'assets' THEN
NEW.search_document :=
normalize_search_text(
coalesce(NEW.caption, '') || ' ' ||
coalesce(NEW.asset_type::TEXT, '') || ' ' ||
coalesce(NEW.mime_type, '') || ' ' ||
coalesce(NEW.file_path, '')
);
RETURN NEW;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_same_process_lineage()
RETURNS TRIGGER AS $$
DECLARE
parent_process_id UUID;
parent_version_number INTEGER;
current_version_id UUID;
current_process_id UUID;
BEGIN

IF NEW.derived_from_version_id IS NULL THEN
RETURN NEW;
END IF;

-- Check that derived_from_version_id exists
SELECT pv.process_id, pv.version_number
INTO parent_process_id, parent_version_number
FROM process_versions pv
WHERE pv.id = NEW.derived_from_version_id;

IF parent_process_id IS NULL THEN
RAISE EXCEPTION
'derived_from_version_id % does not reference an existing process version',
NEW.derived_from_version_id;
END IF;

-- Check that it belongs to the same process
IF parent_process_id <> NEW.process_id THEN
RAISE EXCEPTION
'derived_from_version_id % must belong to the same process as process_id %',
NEW.derived_from_version_id,
NEW.process_id;
END IF;

-- Check that derived version has a lower version number
IF parent_version_number >= NEW.version_number THEN
RAISE EXCEPTION
'derived_from_version_id % must have a lower version_number (% < %)',
NEW.derived_from_version_id,
parent_version_number,
NEW.version_number;
END IF;

-- Check for circular references (prevent v1 -> v2 -> v1)
current_version_id := NEW.derived_from_version_id;
WHILE current_version_id IS NOT NULL LOOP
  SELECT pv.derived_from_version_id, pv.process_id
  INTO current_version_id, current_process_id
  FROM process_versions pv
  WHERE pv.id = current_version_id;
  
  -- If we loop back to the current version, we have a circular reference
  IF current_version_id = NEW.id THEN
    RAISE EXCEPTION
    'Circular reference detected in version lineage starting from version %',
    NEW.id;
  END IF;
  
  -- Safety: prevent infinite loops
  EXIT WHEN current_version_id IS NULL;
END LOOP;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. STATE MACHINE (ENUMS)
--
-- Represents:
-- 1) the exact lifecycle workflow states
-- 2) the AS-IS / TO-BE architectural view
--
-- These are different concepts and must be modeled separately.
-- ============================================================================
CREATE TYPE process_lifecycle_state AS ENUM (
    'Draft',
    'In Review',
    'Approved',
    'Published',
    'Archived'
);

CREATE TYPE process_architecture_state AS ENUM (
    'AS-IS',
    'TO-BE'
);

-- ============================================================================
-- ASSET TYPES
--
-- Initial scope simplification:
-- The prototype only needs BPMN viewing and optional static support files.
-- BPMN, DMN, PNG, SVG, PDF and other advanced artifact categories were removed from the initial scope
-- to reduce implementation complexity.
-- ============================================================================
CREATE TYPE asset_type AS ENUM (
    'BPMN',
    'DMN',
    'PNG',
    'SVG',
    'PDF'
);

-- ============================================================================
-- AUDIT ACTIONS
--
-- Updated to reflect the final governance model:
-- - REVIEWER approves/rejects
-- - PUBLISHER publishes/archives/promotes
-- - SYSTEM_ADMIN performs technical-only administration
-- ============================================================================
CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'STATE_CHANGE',
    'APPROVE',
    'REJECT',
    'REOPEN',
    'PUBLISH',
    'ARCHIVE',
    'UPLOAD',
    'PROMOTE',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DEACTIVATE',
    'ROLE_ASSIGN',
    'TEAM_CHANGE'
);

-- ============================================================================
-- 2. RBAC & SECURITY (Users, Roles & Teams)
--
-- Standardizes team identities linked to the user model and supports RBAC.
-- ============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_roles_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT chk_roles_description_not_blank CHECK (btrim(description) <> '')
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_teams_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT chk_teams_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT chk_teams_description_not_blank CHECK (btrim(description) <> ''),
    CONSTRAINT chk_teams_updated_at_after_created_at CHECK (updated_at >= created_at)
);

CREATE TABLE team_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    alias VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT chk_users_email_not_blank CHECK (btrim(email) <> ''),
    CONSTRAINT chk_users_password_not_blank CHECK (btrim(password_hash) <> ''),
    CONSTRAINT chk_users_updated_at_after_created_at CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX uq_users_email_normalized
ON users (lower(email));

-- ============================================================================
-- 3. BUSINESS GLOSSARY / STANDARDIZED VOCABULARY
--
-- Helps solve semantic confusion in hierarchy and terminology.
--
-- DB-level additions:
-- - non-blank term
-- - non-blank definition
-- - unique normalized term
-- - unique normalized definition
-- ============================================================================
CREATE TABLE glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    category VARCHAR(100),
    is_preferred BOOLEAN NOT NULL DEFAULT TRUE,
    search_document TEXT NOT NULL DEFAULT '',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_glossary_term_not_blank CHECK (btrim(term) <> ''),
    CONSTRAINT chk_glossary_definition_not_blank CHECK (btrim(definition) <> '')
);

CREATE UNIQUE INDEX uq_glossary_terms_term_normalized
ON glossary_terms (normalize_search_text(term));

CREATE UNIQUE INDEX uq_glossary_terms_definition_normalized
ON glossary_terms (normalize_search_text(definition));

-- ============================================================================
-- 3A. ITIL 4 PRACTICES
--
-- Standardizes the top-level ITIL 4 practice classification used by Areas.
-- ============================================================================
CREATE TABLE itil_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_itil_practices_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT chk_itil_practices_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT chk_itil_practices_description_not_blank CHECK (btrim(description) <> ''),
    CONSTRAINT chk_itil_practices_updated_at_after_created_at CHECK (updated_at >= created_at)
);

-- ============================================================================
-- 4. THE ITIL HIERARCHY: LEVEL 1 - AREAS
-- ============================================================================
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itil_practice_id UUID NOT NULL REFERENCES itil_practices(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_areas_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT chk_areas_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT chk_areas_description_not_blank CHECK (btrim(description) <> ''),
    CONSTRAINT chk_areas_updated_at_after_created_at CHECK (updated_at >= created_at)
);

-- ============================================================================
-- 5. THE ITIL HIERARCHY: LEVEL 2 - PROCESSES
-- ============================================================================
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_processes_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT chk_processes_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT chk_processes_description_not_blank CHECK (btrim(description) <> ''),
    CONSTRAINT chk_processes_updated_at_after_created_at CHECK (updated_at >= created_at)
);

-- ============================================================================
-- 6. PROCESS VERSIONING & STATE TRACKING
--
-- DB-level addition:
-- same-process lineage validation through trigger
-- ============================================================================
CREATE TABLE process_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    lifecycle_state process_lifecycle_state NOT NULL DEFAULT 'Draft',
    architecture_state process_architecture_state NOT NULL,
    title VARCHAR(255) NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    checklist_completed BOOLEAN NOT NULL DEFAULT FALSE,
    derived_from_version_id UUID REFERENCES process_versions(id) ON DELETE RESTRICT,
    change_description TEXT NOT NULL,
    reason_for_change TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_process_versions_process_version UNIQUE (process_id, version_number),
    CONSTRAINT chk_process_versions_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT chk_process_versions_change_description_not_blank CHECK (btrim(change_description) <> ''),
    CONSTRAINT chk_process_versions_reason_for_change_not_blank CHECK (btrim(reason_for_change) <> ''),
    CONSTRAINT chk_process_versions_updated_at_after_created_at CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX uq_one_published_version_per_process_architecture
ON process_versions (process_id, architecture_state)
WHERE lifecycle_state = 'Published';

-- ============================================================================
-- 6A. EXPLICIT LIFECYCLE TRANSITION HISTORY
-- ============================================================================
CREATE TABLE version_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_version_id UUID NOT NULL REFERENCES process_versions(id) ON DELETE CASCADE,
    from_state process_lifecycle_state,
    to_state process_lifecycle_state NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_version_state_history_no_duplicate_transition CHECK (from_state IS NULL OR from_state <> to_state)
);

-- ============================================================================
-- 7. THE ITIL HIERARCHY: LEVEL 3 - PROCEDURES
-- ============================================================================
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_version_id UUID NOT NULL REFERENCES process_versions(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    utility TEXT NOT NULL,
    warranty TEXT NOT NULL,
    outcome TEXT NOT NULL,
    policy TEXT NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    activities JSONB DEFAULT '[]'::jsonb,
    inputs JSONB DEFAULT '[]'::jsonb,
    outputs JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_procedures_version_code UNIQUE (process_version_id, code),
    CONSTRAINT chk_procedures_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT chk_procedures_title_not_blank CHECK (btrim(title) <> ''),
    CONSTRAINT chk_procedures_utility_not_blank CHECK (btrim(utility) <> ''),
    CONSTRAINT chk_procedures_warranty_not_blank CHECK (btrim(warranty) <> ''),
    CONSTRAINT chk_procedures_outcome_not_blank CHECK (btrim(outcome) <> ''),
    CONSTRAINT chk_procedures_policy_not_blank CHECK (btrim(policy) <> ''),
    CONSTRAINT chk_procedures_updated_at_after_created_at CHECK (updated_at >= created_at)
);

-- ============================================================================
-- 8. ASSETS / FILE INVENTORY
-- ============================================================================
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_version_id UUID NOT NULL REFERENCES process_versions(id) ON DELETE RESTRICT,
    caption VARCHAR(255) NOT NULL,
    search_document TEXT NOT NULL DEFAULT '',
    asset_type asset_type NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_assets_file_path_not_blank CHECK (btrim(file_path) <> '')
);

-- ============================================================================
-- 9. IMMUTABLE AUDIT TRAIL
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason_for_change TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_logs_entity_type_not_blank CHECK (btrim(entity_type) <> ''),
    CONSTRAINT chk_audit_logs_entity_type_valid CHECK (entity_type IN ('area', 'process', 'process_version', 'procedure', 'asset', 'user', 'role', 'team', 'glossary_term', 'itil_practice'))
);

-- ============================================================================
-- 10. INDEXES
-- ============================================================================
CREATE UNIQUE INDEX uq_processes_code_normalized
ON processes (normalize_search_text(code));

CREATE UNIQUE INDEX uq_areas_code_normalized
ON areas (normalize_search_text(code));

CREATE UNIQUE INDEX uq_itil_practices_code_normalized
ON itil_practices (normalize_search_text(code));

CREATE UNIQUE INDEX uq_teams_code_normalized
ON teams (normalize_search_text(code));
CREATE INDEX idx_team_aliases_team_id ON team_aliases(team_id);
CREATE INDEX idx_areas_owner_id ON areas(owner_id);
CREATE INDEX idx_processes_owner_id ON processes(owner_id);
CREATE INDEX idx_procedures_created_by ON procedures(created_by);
CREATE INDEX idx_procedures_updated_by ON procedures(updated_by);
CREATE INDEX idx_assets_created_by ON assets(created_by);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_glossary_terms_created_by ON glossary_terms(created_by);
CREATE INDEX idx_processes_created_by ON processes(created_by);
CREATE INDEX idx_processes_updated_by ON processes(updated_by);
CREATE INDEX idx_process_versions_created_by ON process_versions(created_by);
CREATE INDEX idx_process_versions_updated_by ON process_versions(updated_by);
CREATE INDEX idx_areas_created_by ON areas(created_by);
CREATE INDEX idx_areas_updated_by ON areas(updated_by);
CREATE INDEX idx_itil_practices_code ON itil_practices(code);
CREATE INDEX idx_itil_practices_name ON itil_practices(name);
CREATE INDEX idx_areas_itil_practice_id ON areas(itil_practice_id);
CREATE INDEX idx_areas_code ON areas(code);
CREATE INDEX idx_areas_title ON areas(title);
CREATE INDEX idx_processes_area_id ON processes(area_id);
CREATE INDEX idx_processes_code ON processes(code);
CREATE INDEX idx_processes_title ON processes(title);
CREATE INDEX idx_process_versions_process_id ON process_versions(process_id);
CREATE INDEX idx_process_versions_lifecycle_state ON process_versions(lifecycle_state);
CREATE INDEX idx_process_versions_architecture_state ON process_versions(architecture_state);
CREATE INDEX idx_process_versions_derived_from_version_id ON process_versions(derived_from_version_id);
CREATE INDEX idx_procedures_process_version_id ON procedures(process_version_id);
CREATE INDEX idx_procedures_code ON procedures(code);
CREATE INDEX idx_procedures_title ON procedures(title);
CREATE INDEX idx_assets_process_version_id ON assets(process_version_id);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_version_state_history_process_version_id
ON version_state_history(process_version_id);

CREATE INDEX idx_version_state_history_created_at
ON version_state_history(created_at);

CREATE INDEX idx_version_state_history_version_created_at
ON version_state_history(process_version_id, created_at);

-- ============================================================================
-- 11. TRIGRAM GIN INDEXES
-- ============================================================================
CREATE INDEX idx_teams_search_trgm
ON teams USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_glossary_terms_search_trgm
ON glossary_terms USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_itil_practices_search_trgm
ON itil_practices USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_areas_search_trgm
ON areas USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_processes_search_trgm
ON processes USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_process_versions_search_trgm
ON process_versions USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_procedures_search_trgm
ON procedures USING GIN (search_document gin_trgm_ops);

CREATE INDEX idx_assets_search_trgm
ON assets USING GIN (search_document gin_trgm_ops);

-- ============================================================================
-- 12. UPDATED_AT TRIGGERS
-- ============================================================================
CREATE TRIGGER trg_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_itil_practices_updated_at
BEFORE UPDATE ON itil_practices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_areas_updated_at
BEFORE UPDATE ON areas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_processes_updated_at
BEFORE UPDATE ON processes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_process_versions_updated_at
BEFORE UPDATE ON process_versions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_procedures_updated_at
BEFORE UPDATE ON procedures
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 13. SEARCH DOCUMENT TRIGGERS
-- ============================================================================
CREATE TRIGGER trg_teams_search_document
BEFORE INSERT OR UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_glossary_terms_search_document
BEFORE INSERT OR UPDATE ON glossary_terms
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_itil_practices_search_document
BEFORE INSERT OR UPDATE ON itil_practices
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_areas_search_document
BEFORE INSERT OR UPDATE ON areas
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_processes_search_document
BEFORE INSERT OR UPDATE ON processes
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_process_versions_search_document
BEFORE INSERT OR UPDATE ON process_versions
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_procedures_search_document
BEFORE INSERT OR UPDATE ON procedures
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

CREATE TRIGGER trg_assets_search_document
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION set_search_document();

-- ============================================================================
-- 14. BUSINESS-RULE ENFORCEMENT TRIGGERS
--
-- Only DB-level structural rules are enforced here.
-- Workflow, RBAC, BPMN validation, and lifecycle policy remain in the backend.
-- ============================================================================
CREATE TRIGGER trg_process_versions_same_process_lineage
BEFORE INSERT OR UPDATE OF process_id, derived_from_version_id
ON process_versions
FOR EACH ROW
EXECUTE FUNCTION validate_same_process_lineage();

-- ============================================================================
-- 15. INITIAL SEARCH DOCUMENT BACKFILL
--
-- If this schema is run on an empty database, these UPDATEs are harmless.
-- If it is run on an existing database with imported data, they immediately
-- populate the new search_document columns.
-- ============================================================================
UPDATE teams
SET search_document = normalize_search_text(
coalesce(code, '') || ' ' ||
coalesce(name, '') || ' ' ||
coalesce(description, '')
);

UPDATE glossary_terms
SET search_document = normalize_search_text(
coalesce(term, '') || ' ' ||
coalesce(definition, '') || ' ' ||
coalesce(category, '')
);

UPDATE itil_practices
SET search_document = normalize_search_text(
coalesce(code, '') || ' ' ||
coalesce(name, '') || ' ' ||
coalesce(description, '')
);

UPDATE areas
SET search_document = normalize_search_text(
coalesce(code, '') || ' ' ||
coalesce(title, '') || ' ' ||
coalesce(description, '')
);

UPDATE processes
SET search_document = normalize_search_text(
coalesce(code, '') || ' ' ||
coalesce(title, '') || ' ' ||
coalesce(description, '')
);

UPDATE process_versions
SET search_document = normalize_search_text(
coalesce(version_number::TEXT, '') || ' ' ||
coalesce(title, '') || ' ' ||
coalesce(change_description, '') || ' ' ||
coalesce(reason_for_change, '')
);

UPDATE procedures
SET search_document = normalize_search_text(
coalesce(code, '') || ' ' ||
coalesce(title, '') || ' ' ||
coalesce(utility, '') || ' ' ||
coalesce(warranty, '') || ' ' ||
coalesce(outcome, '') || ' ' ||
coalesce(policy, '') || ' ' ||
coalesce(activities::TEXT, '') || ' ' ||
coalesce(inputs::TEXT, '') || ' ' ||
coalesce(outputs::TEXT, '')
);

UPDATE assets
SET search_document = normalize_search_text(
coalesce(caption, '') || ' ' ||
coalesce(asset_type::TEXT, '') || ' ' ||
coalesce(mime_type, '') || ' ' ||
coalesce(file_path, '')
);
`;

const DROP_INITIAL_SCHEMA_SQL = `
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS procedures CASCADE;
DROP TABLE IF EXISTS version_state_history CASCADE;
DROP TABLE IF EXISTS process_versions CASCADE;
DROP TABLE IF EXISTS processes CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS itil_practices CASCADE;
DROP TABLE IF EXISTS glossary_terms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS team_aliases CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

DROP FUNCTION IF EXISTS validate_same_process_lineage() CASCADE;
DROP FUNCTION IF EXISTS set_search_document() CASCADE;
DROP FUNCTION IF EXISTS normalize_search_text(TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS asset_type CASCADE;
DROP TYPE IF EXISTS process_architecture_state CASCADE;
DROP TYPE IF EXISTS process_lifecycle_state CASCADE;

DROP EXTENSION IF EXISTS unaccent;
DROP EXTENSION IF EXISTS pg_trgm;
DROP EXTENSION IF EXISTS pgcrypto;
`;

export class InitialSchema20260423030000 implements MigrationInterface {
  public readonly name = 'InitialSchema20260423030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(INITIAL_SCHEMA_SQL);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(DROP_INITIAL_SCHEMA_SQL);
  }
}
