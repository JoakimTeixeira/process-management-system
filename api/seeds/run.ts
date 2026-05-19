import * as argon2 from 'argon2';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DataSource, EntityManager } from 'typeorm';

import { loadProjectEnvironment } from '../src/config/env-paths';
import dataSource from '../src/database/typeorm.datasource';
import {
  areas,
  auditLogs,
  BPMN_DIRECTORY,
  bpmnAssets,
  glossaryTerms,
  itilPractices,
  processes,
  procedures,
  processVersions,
  roles,
  teams,
  users,
  versionStateHistory,
} from './seed-data';

loadProjectEnvironment();

type SqlExecutor = Pick<EntityManager, 'query'>;

interface QueryRow {
  [key: string]: unknown;
}

interface IdRow extends QueryRow {
  id: string;
}

interface SeedContext {
  roleIds: Map<string, string>;
  teamIds: Map<string, string>;
  userIds: Map<string, string>;
  practiceIds: Map<string, string>;
  areaIds: Map<string, string>;
  processIds: Map<string, string>;
  versionIds: Map<string, string>;
}

const TEAM_IS_ACTIVE = true;

const seededUserTeamCodes = new Map(
  users.map((user) => [user.email, user.teamCode] as const),
);

function buildVersionKey(processCode: string, versionNumber: number): string {
  return `${processCode}@${versionNumber}`;
}

async function queryRows<T extends QueryRow>(
  manager: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T[]> {
  return await manager.query(sql, [...parameters]);
}

async function queryFirstRow<T extends QueryRow>(
  manager: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<T | null> {
  const result = await queryRows<T>(manager, sql, parameters);

  // Handle case where TypeORM returns an array of arrays
  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    // If the first element is an array, take its first element
    if (Array.isArray(first)) {
      return (first[0] as T) ?? null;
    }
    return first ?? null;
  }

  return null;
}

async function queryRequiredId(
  manager: SqlExecutor,
  sql: string,
  parameters: readonly unknown[] = [],
): Promise<string> {
  const row = await queryFirstRow<IdRow>(manager, sql, parameters);

  if (!row) {
    throw new Error('Expected INSERT/UPDATE statement to return an id');
  }

  return row.id;
}

function getRequiredEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  throw new Error(
    `Missing required environment variable: ${names.join(' or ')}`,
  );
}

function getBpmnFilename(processCode: string, versionNumber: number): string {
  const safeCode = processCode.replaceAll(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

  return `process-${safeCode}-v${versionNumber}.bpmn`;
}

function buildBpmnXml(processCode: string, title: string): string {
  const safeCode = `process_${processCode.replaceAll(/[^a-zA-Z0-9]+/g, '_')}`;
  const definitionId = `${safeCode}_Definitions`;
  const processId = `${safeCode}_Process`;
  const startId = `${safeCode}_Start`;
  const taskId = `${safeCode}_Task`;
  const endId = `${safeCode}_End`;
  const flowOneId = `${safeCode}_Flow_1`;
  const flowTwoId = `${safeCode}_Flow_2`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="${definitionId}"
  targetNamespace="https://pms.local/bpmn">
  <bpmn:process id="${processId}" isExecutable="false" name="${title}">
    <bpmn:startEvent id="${startId}" name="Start">
      <bpmn:outgoing>${flowOneId}</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="${taskId}" name="Review Repository Step">
      <bpmn:incoming>${flowOneId}</bpmn:incoming>
      <bpmn:outgoing>${flowTwoId}</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="${endId}" name="End">
      <bpmn:incoming>${flowTwoId}</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="${flowOneId}" sourceRef="${startId}" targetRef="${taskId}" />
    <bpmn:sequenceFlow id="${flowTwoId}" sourceRef="${taskId}" targetRef="${endId}" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="${safeCode}_Diagram">
    <bpmndi:BPMNPlane id="${safeCode}_Plane" bpmnElement="${processId}">
      <bpmndi:BPMNShape id="${startId}_di" bpmnElement="${startId}">
        <dc:Bounds x="100" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="${taskId}_di" bpmnElement="${taskId}">
        <dc:Bounds x="190" y="78" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="${endId}_di" bpmnElement="${endId}">
        <dc:Bounds x="390" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="${flowOneId}_di" bpmnElement="${flowOneId}">
        <di:waypoint x="136" y="118" />
        <di:waypoint x="190" y="118" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="${flowTwoId}_di" bpmnElement="${flowTwoId}">
        <di:waypoint x="330" y="118" />
        <di:waypoint x="390" y="118" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
}

async function upsertRole(
  manager: SqlExecutor,
  name: string,
  description: string,
): Promise<string> {
  return queryRequiredId(
    manager,
    `
      INSERT INTO roles (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name)
      DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `,
    [name, description],
  );
}

async function upsertTeam(
  manager: SqlExecutor,
  code: string,
  name: string,
  description: string,
  isActive: boolean,
): Promise<string> {
  return queryRequiredId(
    manager,
    `
      INSERT INTO teams (code, name, description, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (code)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active
      RETURNING id
    `,
    [code, name, description, isActive],
  );
}

async function upsertUser(
  manager: SqlExecutor,
  params: {
    email: string;
    name: string;
    roleId: string;
    teamId: string;
    passwordHash: string;
  },
): Promise<string> {
  const existing = await queryFirstRow<IdRow>(
    manager,
    `
      SELECT id
      FROM users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [params.email],
  );

  if (existing) {
    return queryRequiredId(
      manager,
      `
        UPDATE users
        SET
          role_id = $2,
          team_id = $3,
          name = $4,
          password_hash = $5
        WHERE id = $1
        RETURNING id
      `,
      [
        existing.id,
        params.roleId,
        params.teamId,
        params.name,
        params.passwordHash,
      ],
    );
  }

  return queryRequiredId(
    manager,
    `
      INSERT INTO users (role_id, team_id, name, email, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      params.roleId,
      params.teamId,
      params.name,
      params.email,
      params.passwordHash,
    ],
  );
}

async function upsertGlossaryTerm(
  manager: SqlExecutor,
  params: {
    term: string;
    definition: string;
    category: string;
    createdBy: string;
  },
): Promise<string> {
  const existing = await queryFirstRow<IdRow>(
    manager,
    `
      SELECT id
      FROM glossary_terms
      WHERE term = $1
      LIMIT 1
    `,
    [params.term],
  );

  if (existing) {
    return queryRequiredId(
      manager,
      `
        UPDATE glossary_terms
        SET
          definition = $2,
          category = $3,
          created_by = $4,
          is_preferred = TRUE
        WHERE id = $1
        RETURNING id
      `,
      [existing.id, params.definition, params.category, params.createdBy],
    );
  }

  return queryRequiredId(
    manager,
    `
      INSERT INTO glossary_terms (term, definition, category, is_preferred, created_by)
      VALUES ($1, $2, $3, TRUE, $4)
      RETURNING id
    `,
    [params.term, params.definition, params.category, params.createdBy],
  );
}

async function upsertItilPractice(
  manager: SqlExecutor,
  code: string,
  name: string,
  description: string,
): Promise<string> {
  return queryRequiredId(
    manager,
    `
      INSERT INTO itil_practices (code, name, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (code)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
      RETURNING id
    `,
    [code, name, description],
  );
}

async function upsertArea(
  manager: SqlExecutor,
  params: {
    code: string;
    title: string;
    description: string;
    itilPracticeId: string;
    teamId: string;
    ownerId: string;
    authorId: string;
  },
): Promise<string> {
  return queryRequiredId(
    manager,
    `
      INSERT INTO areas (
        itil_practice_id,
        code,
        title,
        description,
        team_id,
        owner_id,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      ON CONFLICT (code)
      DO UPDATE SET
        itil_practice_id = EXCLUDED.itil_practice_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        team_id = EXCLUDED.team_id,
        owner_id = EXCLUDED.owner_id,
        updated_by = EXCLUDED.updated_by
      RETURNING id
    `,
    [
      params.itilPracticeId,
      params.code,
      params.title,
      params.description,
      params.teamId,
      params.ownerId,
      params.authorId,
    ],
  );
}

async function upsertProcess(
  manager: SqlExecutor,
  params: {
    areaId: string;
    code: string;
    title: string;
    description: string;
    teamId: string;
    ownerId: string;
    authorId: string;
  },
): Promise<string> {
  return queryRequiredId(
    manager,
    `
      INSERT INTO processes (
        area_id,
        code,
        title,
        description,
        team_id,
        owner_id,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      ON CONFLICT (code)
      DO UPDATE SET
        area_id = EXCLUDED.area_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        team_id = EXCLUDED.team_id,
        owner_id = EXCLUDED.owner_id,
        updated_by = EXCLUDED.updated_by
      RETURNING id
    `,
    [
      params.areaId,
      params.code,
      params.title,
      params.description,
      params.teamId,
      params.ownerId,
      params.authorId,
    ],
  );
}

async function upsertProcessVersion(
  manager: SqlExecutor,
  params: {
    processId: string;
    versionNumber: number;
    lifecycleState: string;
    architectureState: string;
    title: string;
    checklistCompleted: boolean;
    derivedFromVersionId: string | null;
    changeDescription: string;
    reasonForChange: string;
    createdBy: string;
    updatedBy: string;
  },
): Promise<string> {
  if (params.lifecycleState === 'Published') {
    await queryRows(
      manager,
      `
        UPDATE process_versions
        SET lifecycle_state = 'Archived'::process_lifecycle_state,
            updated_by = $4
        WHERE process_id = $1
          AND architecture_state = $2::process_architecture_state
          AND lifecycle_state = 'Published'::process_lifecycle_state
          AND version_number <> $3
      `,
      [
        params.processId,
        params.architectureState,
        params.versionNumber,
        params.updatedBy,
      ],
    );
  }

  return queryRequiredId(
    manager,
    `
      INSERT INTO process_versions (
        process_id,
        version_number,
        lifecycle_state,
        architecture_state,
        title,
        checklist_completed,
        derived_from_version_id,
        change_description,
        reason_for_change,
        created_by,
        updated_by
      )
      VALUES (
        $1,
        $2,
        $3::process_lifecycle_state,
        $4::process_architecture_state,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      ON CONFLICT (process_id, version_number)
      DO UPDATE SET
        lifecycle_state = EXCLUDED.lifecycle_state,
        architecture_state = EXCLUDED.architecture_state,
        title = EXCLUDED.title,
        checklist_completed = EXCLUDED.checklist_completed,
        derived_from_version_id = EXCLUDED.derived_from_version_id,
        change_description = EXCLUDED.change_description,
        reason_for_change = EXCLUDED.reason_for_change,
        updated_by = EXCLUDED.updated_by
      RETURNING id
    `,
    [
      params.processId,
      params.versionNumber,
      params.lifecycleState,
      params.architectureState,
      params.title,
      params.checklistCompleted,
      params.derivedFromVersionId,
      params.changeDescription,
      params.reasonForChange,
      params.createdBy,
      params.updatedBy,
    ],
  );
}

async function upsertProcedure(
  manager: SqlExecutor,
  params: {
    processVersionId: string;
    code: string;
    title: string;
    utility: string;
    warranty: string;
    outcome: string;
    policy: string;
    activities: unknown[];
    inputs: string[];
    outputs: string[];
    authorId: string;
  },
): Promise<void> {
  await queryRows(
    manager,
    `
      INSERT INTO procedures (
        process_version_id,
        code,
        title,
        utility,
        warranty,
        outcome,
        policy,
        activities,
        inputs,
        outputs,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11, $11)
      ON CONFLICT (process_version_id, code)
      DO UPDATE SET
        title = EXCLUDED.title,
        utility = EXCLUDED.utility,
        warranty = EXCLUDED.warranty,
        outcome = EXCLUDED.outcome,
        policy = EXCLUDED.policy,
        activities = EXCLUDED.activities,
        inputs = EXCLUDED.inputs,
        outputs = EXCLUDED.outputs,
        updated_by = EXCLUDED.updated_by
    `,
    [
      params.processVersionId,
      params.code,
      params.title,
      params.utility,
      params.warranty,
      params.outcome,
      params.policy,
      JSON.stringify(params.activities),
      JSON.stringify(params.inputs),
      JSON.stringify(params.outputs),
      params.authorId,
    ],
  );
}

async function writeSeedBpmnFiles(): Promise<
  Map<string, { filePath: string; size: number; checksum: string }>
> {
  const uploadsDirectory = join(process.cwd(), 'uploads', BPMN_DIRECTORY);
  const result = new Map<
    string,
    { filePath: string; size: number; checksum: string }
  >();

  await mkdir(uploadsDirectory, { recursive: true });

  for (const version of processVersions) {
    const filename = getBpmnFilename(
      version.processCode,
      version.versionNumber,
    );
    const relativePath = `${BPMN_DIRECTORY}/${filename}`;
    const absolutePath = join(uploadsDirectory, filename);
    const xml = buildBpmnXml(version.processCode, version.title);

    await writeFile(absolutePath, xml, 'utf8');

    result.set(buildVersionKey(version.processCode, version.versionNumber), {
      filePath: relativePath,
      size: Buffer.byteLength(xml, 'utf8'),
      checksum: createHash('sha256').update(xml).digest('hex'),
    });
  }

  return result;
}

async function seedRoles(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const role of roles) {
    const roleId = await upsertRole(manager, role.name, role.description);
    context.roleIds.set(role.name, roleId);
  }
}

async function seedTeams(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const team of teams) {
    const teamId = await upsertTeam(
      manager,
      team.code,
      team.name,
      team.description,
      TEAM_IS_ACTIVE,
    );
    context.teamIds.set(team.code, teamId);
  }

  const seededTeamIds = [...context.teamIds.values()];

  if (seededTeamIds.length > 0) {
    await queryRows(
      manager,
      `
        DELETE FROM team_aliases
        WHERE team_id = ANY($1::uuid[])
      `,
      [seededTeamIds],
    );
  }

  for (const team of teams) {
    const teamId = context.teamIds.get(team.code);

    if (!teamId) {
      throw new Error(`Missing team id for ${team.code}`);
    }

    for (const alias of team.aliases) {
      await queryRows(
        manager,
        `
          INSERT INTO team_aliases (team_id, alias)
          VALUES ($1, $2)
          ON CONFLICT (alias)
          DO UPDATE SET team_id = EXCLUDED.team_id
        `,
        [teamId, alias],
      );
    }
  }
}

async function seedUsers(
  manager: SqlExecutor,
  context: SeedContext,
  passwordHash: string,
): Promise<void> {
  for (const user of users) {
    const roleId = context.roleIds.get(user.roleName);
    const teamId = context.teamIds.get(user.teamCode);

    if (!roleId) {
      throw new Error(`Missing role for seeded user ${user.email}`);
    }

    if (!teamId) {
      throw new Error(`Missing team for seeded user ${user.email}`);
    }

    const userId = await upsertUser(manager, {
      email: user.email,
      name: user.name,
      roleId,
      teamId,
      passwordHash,
    });

    context.userIds.set(user.email, userId);
  }
}

async function seedGlossaryTerms(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  const editorId = context.userIds.get('alice.editor@example.com');

  if (!editorId) {
    throw new Error('Missing editor id while seeding glossary terms');
  }

  for (const term of glossaryTerms) {
    await upsertGlossaryTerm(manager, {
      term: term.term,
      definition: term.definition,
      category: term.category,
      createdBy: editorId,
    });
  }
}

async function seedItilPractices(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const practice of itilPractices) {
    const practiceId = await upsertItilPractice(
      manager,
      practice.code,
      practice.name,
      practice.description,
    );

    context.practiceIds.set(practice.code, practiceId);
  }
}

async function seedAreas(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const area of areas) {
    const practiceId = context.practiceIds.get(area.itilPracticeCode);
    const ownerTeamCode = seededUserTeamCodes.get(area.ownerEmail);
    const teamId = ownerTeamCode ? context.teamIds.get(ownerTeamCode) : null;
    const ownerId = context.userIds.get(area.ownerEmail);
    const editorId = context.userIds.get('alice.editor@example.com');

    if (!practiceId || !teamId || !ownerId || !editorId) {
      throw new Error(`Missing dependency for area ${area.code}`);
    }

    const areaId = await upsertArea(manager, {
      code: area.code,
      title: area.title,
      description: area.description,
      itilPracticeId: practiceId,
      teamId,
      ownerId,
      authorId: editorId,
    });

    context.areaIds.set(area.code, areaId);
  }
}

async function seedProcesses(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const process of processes) {
    const areaId = context.areaIds.get(process.areaCode);
    const ownerTeamCode = seededUserTeamCodes.get(process.ownerEmail);
    const teamId = ownerTeamCode ? context.teamIds.get(ownerTeamCode) : null;
    const ownerId = context.userIds.get(process.ownerEmail);
    const editorId = context.userIds.get('alice.editor@example.com');

    if (!areaId || !teamId || !ownerId || !editorId) {
      throw new Error(`Missing dependency for process ${process.code}`);
    }

    const processId = await upsertProcess(manager, {
      areaId,
      code: process.code,
      title: process.title,
      description: process.description,
      teamId,
      ownerId,
      authorId: editorId,
    });

    context.processIds.set(process.code, processId);
  }
}

async function seedProcessVersions(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  for (const version of processVersions) {
    const processId = context.processIds.get(version.processCode);
    const editorId = context.userIds.get('alice.editor@example.com');
    const updatedById = context.userIds.get(version.updatedByEmail);

    if (!processId || !editorId || !updatedById) {
      throw new Error(
        `Missing dependency for version ${buildVersionKey(version.processCode, version.versionNumber)}`,
      );
    }

    const derivedFromVersionId = version.derivedFromVersionRef
      ? (context.versionIds.get(version.derivedFromVersionRef) ?? null)
      : null;

    if (version.derivedFromVersionRef && !derivedFromVersionId) {
      throw new Error(
        `Missing derived version for ${buildVersionKey(version.processCode, version.versionNumber)}: ${version.derivedFromVersionRef}`,
      );
    }

    const versionId = await upsertProcessVersion(manager, {
      processId,
      versionNumber: version.versionNumber,
      lifecycleState: version.lifecycleState,
      architectureState: version.architectureState,
      title: version.title,
      checklistCompleted: version.checklistCompleted,
      derivedFromVersionId,
      changeDescription: version.changeDescription,
      reasonForChange: version.reasonForChange,
      createdBy: editorId,
      updatedBy: updatedById,
    });

    context.versionIds.set(
      buildVersionKey(version.processCode, version.versionNumber),
      versionId,
    );
  }
}

async function reseedProcedures(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  const targetVersionIds = procedures
    .map((procedure) =>
      context.versionIds.get(
        buildVersionKey(procedure.processCode, procedure.versionNumber),
      ),
    )
    .filter((versionId): versionId is string => Boolean(versionId));

  if (targetVersionIds.length > 0) {
    await queryRows(
      manager,
      `
        DELETE FROM procedures
        WHERE process_version_id = ANY($1::uuid[])
      `,
      [targetVersionIds],
    );
  }

  const editorId = context.userIds.get('alice.editor@example.com');

  if (!editorId) {
    throw new Error('Missing editor id while seeding procedures');
  }

  for (const procedure of procedures) {
    const processVersionId = context.versionIds.get(
      buildVersionKey(procedure.processCode, procedure.versionNumber),
    );

    if (!processVersionId) {
      throw new Error(
        `Missing dependency for procedure ${procedure.code} on ${procedure.processCode}@${procedure.versionNumber}`,
      );
    }

    await upsertProcedure(manager, {
      processVersionId,
      code: procedure.code,
      title: procedure.title,
      utility: procedure.utility,
      warranty: procedure.warranty,
      outcome: procedure.outcome,
      policy: procedure.policy,
      activities: procedure.activities,
      inputs: procedure.inputs,
      outputs: procedure.outputs,
      authorId: editorId,
    });
  }
}

async function reseedBpmnAssets(
  manager: SqlExecutor,
  context: SeedContext,
  files: Map<string, { filePath: string; size: number; checksum: string }>,
): Promise<void> {
  const versionIds = [...context.versionIds.values()];

  if (versionIds.length > 0) {
    await queryRows(
      manager,
      `
        DELETE FROM assets
        WHERE process_version_id = ANY($1::uuid[])
      `,
      [versionIds],
    );
  }

  const editorId = context.userIds.get('alice.editor@example.com');

  if (!editorId) {
    throw new Error('Missing editor id while seeding assets');
  }

  for (const asset of bpmnAssets) {
    const versionKey = buildVersionKey(asset.processCode, asset.versionNumber);
    const processVersionId = context.versionIds.get(versionKey);
    const fileMetadata = files.get(versionKey);

    if (!processVersionId || !fileMetadata) {
      throw new Error(`Missing BPMN file metadata for ${versionKey}`);
    }

    await queryRows(
      manager,
      `
        INSERT INTO assets (
          process_version_id,
          caption,
          asset_type,
          file_path,
          mime_type,
          checksum,
          size_bytes,
          created_by
        )
        VALUES (
          $1,
          $2,
          'BPMN'::asset_type,
          $3,
          $4,
          $5,
          $6,
          $7
        )
      `,
      [
        processVersionId,
        asset.caption,
        fileMetadata.filePath,
        'application/xml',
        fileMetadata.checksum,
        fileMetadata.size,
        editorId,
      ],
    );
  }
}

async function reseedVersionHistory(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  const versionIds = [...context.versionIds.values()];

  if (versionIds.length > 0) {
    await queryRows(
      manager,
      `
        DELETE FROM version_state_history
        WHERE process_version_id = ANY($1::uuid[])
      `,
      [versionIds],
    );
  }

  for (const historyEntry of versionStateHistory) {
    const processVersionId = context.versionIds.get(
      buildVersionKey(historyEntry.processCode, historyEntry.versionNumber),
    );
    const actorId = context.userIds.get(historyEntry.actorEmail);

    if (!processVersionId || !actorId) {
      throw new Error(
        `Missing dependency for version history ${historyEntry.processCode}@${historyEntry.versionNumber}`,
      );
    }

    await queryRows(
      manager,
      `
        INSERT INTO version_state_history (
          process_version_id,
          from_state,
          to_state,
          actor_id,
          reason
        )
        VALUES (
          $1,
          $2::process_lifecycle_state,
          $3::process_lifecycle_state,
          $4,
          $5
        )
      `,
      [
        processVersionId,
        historyEntry.fromState,
        historyEntry.toState,
        actorId,
        historyEntry.reason,
      ],
    );
  }
}

function getAuditEntityId(
  context: SeedContext,
  entityType: string,
  entityRef: string,
): string {
  if (entityType === 'user') {
    const userId = context.userIds.get(entityRef);

    if (!userId) {
      throw new Error(`Missing user id for audit entity ${entityRef}`);
    }

    return userId;
  }

  if (entityType === 'area') {
    const areaId = context.areaIds.get(entityRef);

    if (!areaId) {
      throw new Error(`Missing area id for audit entity ${entityRef}`);
    }

    return areaId;
  }

  if (entityType === 'process') {
    const processId = context.processIds.get(entityRef);

    if (!processId) {
      throw new Error(`Missing process id for audit entity ${entityRef}`);
    }

    return processId;
  }

  if (entityType === 'process_version') {
    const versionId = context.versionIds.get(entityRef);

    if (!versionId) {
      throw new Error(`Missing version id for audit entity ${entityRef}`);
    }

    return versionId;
  }

  throw new Error(`Unsupported audit entity type: ${entityType}`);
}

async function reseedAuditLogs(
  manager: SqlExecutor,
  context: SeedContext,
): Promise<void> {
  await queryRows(
    manager,
    `
      DELETE FROM audit_logs
    `,
    [],
  );

  for (const entry of auditLogs) {
    const entityId = getAuditEntityId(
      context,
      entry.entityType,
      entry.entityRef,
    );
    const actorId = context.userIds.get(entry.actorEmail);

    if (!actorId) {
      throw new Error(
        `Missing actor id for audit log ${entry.reasonForChange}`,
      );
    }

    await queryRows(
      manager,
      `
        INSERT INTO audit_logs (
          entity_type,
          entity_id,
          action,
          actor_id,
          reason_for_change,
          old_data,
          new_data
        )
        VALUES (
          $1,
          $2,
          $3::audit_action,
          $4,
          $5,
          $6::jsonb,
          $7::jsonb
        )
      `,
      [
        entry.entityType,
        entityId,
        entry.action,
        actorId,
        entry.reasonForChange,
        entry.oldData ? JSON.stringify(entry.oldData) : null,
        entry.newData ? JSON.stringify(entry.newData) : null,
      ],
    );
  }
}

async function hashDemoPassword(): Promise<string> {
  const pepper = getRequiredEnv('PASSWORD_PEPPER');
  const demoPassword = getRequiredEnv('DEMO_USER_PASSWORD');

  return argon2.hash(demoPassword, {
    type: argon2.argon2id,
    secret: Buffer.from(pepper, 'utf8'),
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

async function runSeed(dataSourceInstance: DataSource): Promise<void> {
  const passwordHash = await hashDemoPassword();
  const bpmnFiles = await writeSeedBpmnFiles();
  const context: SeedContext = {
    roleIds: new Map<string, string>(),
    teamIds: new Map<string, string>(),
    userIds: new Map<string, string>(),
    practiceIds: new Map<string, string>(),
    areaIds: new Map<string, string>(),
    processIds: new Map<string, string>(),
    versionIds: new Map<string, string>(),
  };

  await dataSourceInstance.initialize();

  try {
    await dataSourceInstance.transaction(async (manager) => {
      await seedRoles(manager, context);
      await seedTeams(manager, context);
      await seedUsers(manager, context, passwordHash);
      await seedGlossaryTerms(manager, context);
      await seedItilPractices(manager, context);
      await seedAreas(manager, context);
      await seedProcesses(manager, context);
      await seedProcessVersions(manager, context);
      await reseedProcedures(manager, context);
      await reseedBpmnAssets(manager, context, bpmnFiles);
      await reseedVersionHistory(manager, context);
      await reseedAuditLogs(manager, context);
    });
  } finally {
    await dataSourceInstance.destroy();
  }
}

void runSeed(dataSource)
  .then(() => {
    process.stdout.write('Seed completed successfully.\n');
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
